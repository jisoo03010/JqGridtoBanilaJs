/**
* 이 플러그인은 GridView의 열 잠금 및 테이블 헤더 잠금과 테이블 헤더 조합을 구현하는 데 사용됩니다.
* @예시 $.jqGridView('<%=gvData.ClientID %>', { lockColumns: 3 });
* @param 문자열 gridViewClientID GridView의 클라이언트 ID.
* 옵션 수 lockColumns 잠글 열의 수입니다. 병합 헤더가 포함된 경우 병합 헤더의 열 수와 일치합니다.
* 왼쪽 병합 열의 왼쪽그룹열 HTML(설정하지 않으면 기본적으로 단일 행 헤더로 설정됨).
오른쪽 병합 열의 HTML(설정하지 않으면 기본값은 단일 행 머리글) * @option String rightGroupCols 오른쪽 병합 열의 HTML.
* @option String removeLeftHeaderStrBySplit 구분 기호에 따라 왼쪽 머리글 문자를 제거합니다.
* 구분 기호를 기준으로 오른쪽 머리글 문자열을 제거합니다.
* @option String rowStyle 짝수 행 스타일.
* @option String alternatingRowStyle 홀수 행 스타일.
* @option String hoverRowStyle 호버 행 스타일.
* @option Bool isRemoveEmptyAndZeroCols 빈 열 또는 0 열을 제거할지 여부입니다.
* 처리 후 그리드뷰를 숨길지 여부입니다.
* 처리 후 GridView를 제거할지 여부입니다.
* 데이터가 없을 때 표시할 빈 메시지, 기본값은 “데이터가 없습니다.”입니다. * @옵션 문자열 빈 메시지
* @옵션 이벤트 rowClick 행 클릭 이벤트입니다.
* @author SnowYan 
* @이메일 codelove1314@foxmail.com	
* @웹사이트 http://www.cnblogs.com/codelove/  

Translated with DeepL.com (free version)
*/
jQuery.jqGridView = function (gridViewClientID, options) {
    if (gridViewClientID !== undefined && options !== undefined) {
        function formatHeaderHtml(html) {
            return html.replace(/\<tr/g, '<div class="gv-div-tr" ').replace(/<\/tr>/g, '</div>')
            .replace(/\<th/g, '<div class="gv-div-th" ').replace(/<\/th>/g, '</div>')
            .replace(/\<td/g, '<div class="gv-div-th" ').replace(/<\/td>/g, '</div>');
        }
        //정의된 열
        var lockColumns = options.lockColumns === undefined ? 1 : options.lockColumns;
        //좌측 그룹열HTML
        var leftGroupCols = $(options.leftGroupCols === undefined ? '' : formatHeaderHtml(options.leftGroupCols));
        //右侧组合列HTML
        var rightGroupCols = $(options.rightGroupCols === undefined ? '' : formatHeaderHtml(options.rightGroupCols));
        //근거: 왼쪽 머리글 부호 제거
        var removeLeftHeaderStrBySplit = options.removeLeftHeaderStrBySplit === undefined ? '' : options.removeLeftHeaderStrBySplit;
        var removeRightHeaderStrBySplit = options.removeRightHeaderStrBySplit === undefined ? '' : options.removeRightHeaderStrBySplit;
        //유형
        var rowStyle = options.rowStyle === undefined ? '' : options.rowStyle;
        //기타
        var alternatingRowStyle = options.alternatingRowStyle === undefined ? '' : options.alternatingRowStyle;
          //명칭 표시 방식
        var hoverRowStyle = options.hoverRowStyle === undefined ? '' : options.hoverRowStyle;
        var isSafari = $.browser.safari;
        //데이터 널 표시 콘텐츠
        var emptyMessage = options.emptyMessage === undefined ? '데이터가 없습니다.' : options.emptyMessage;
        var gvData = $('#' + gridViewClientID);
        if (!gvData || gvData.length == 0) {
            console.error("그리드뷰가 존재하지 않습니다, 확인하시기 바랍니다!!!!", gridViewClientID, options);
            return;
        }
        //是否移除空列或者0列
        if (options.isRemoveEmptyAndZeroCols !== undefined && options.isRemoveEmptyAndZeroCols) {
            var arr_remove = new Array(gvData.find('tr:eq(0) th').length);
            var rowsCount = gvData.find('tr:gt(0)').each(function (rIndex) {
                var tr = $(this);
                tr.find('td').each(function (cIndex) {
                    if (arr_remove[cIndex] === undefined || arr_remove[cIndex] == null)
                        arr_remove[cIndex] = 0;
                    var val = $(this).text().replace(/(^\s*)|(\s*$)/g, "");
                    if (val == '' || val == 0) {
                        arr_remove[cIndex]++;
                    }
                });
            }).length;
            gvData.find('tr').each(function (rIndex) {
                var tr = $(this);
                tr.find('td,th').each(function (cIndex) {
                    if (arr_remove[cIndex] == rowsCount)
                        $(this).remove();
                });
            });
        }
        var leftCols = lockColumns - 1;
        var rightCols = lockColumns;
        var isRemoveGridView = options.isRemoveGridView === undefined ? true : options.isRemoveGridView;
        //모든 열 너비
        var colsLengsArr = new Array();
        var colsCount = gvData.find('tr:eq(0) th').each(function (i) {
            colsLengsArr[i] = ($(this).outerWidth() + 1);
        }).length;
        if (lockColumns >= colsCount) lockColumns = colsCount;
        //왼쪽 테이블 너비
        var leftTableWidth = 1;
        //오른쪽 표 너비
        var rightTableWidth = 1;
        for (var i = 0; i < lockColumns; i++) {
            leftTableWidth += (colsLengsArr[i] + 1);
            if (isSafari) leftTableWidth += 0.3;
        }
        for (var i = lockColumns; i < colsLengsArr.length; i++) {
            rightTableWidth += (colsLengsArr[i] + 1);
            if (isSafari) rightTableWidth += 0.3;
        }

        gvData.parent().prepend('<div class="gv-dataContent"></div>');
        var gv_dataContent = $('.gv-dataContent');
        if (gvData.find('tr').length <= 1) {
            gv_dataContent.prepend('<div class="gv-empty">' + emptyMessage + '</div>');
            return;
        }
        //오른쪽 영역의 너비
        var rightAreaWidth = gv_dataContent.width() - (leftTableWidth + 25);
        //데이터 영역의 높이
        var dataAreaHeight = gv_dataContent.height();

        gv_dataContent.prepend('<div class="gv-header-left"></div><div class="gv-header-right"></div><div class="gv-data-left"></div><div class="gv-data-right"></div>');
        var gv_header_left = gv_dataContent.find('div.gv-header-left');
        var gv_header_right = gv_dataContent.find('div.gv-header-right');
        var gv_data_left = gv_dataContent.find('div.gv-data-left');
        var gv_data_right = gv_dataContent.find('div.gv-data-right');
        if (lockColumns == colsCount) {
            gv_header_right.hide(); gv_data_right.hide();
        } else {
            if (rightAreaWidth > 0) {
                gv_header_right.width(rightAreaWidth);
                gv_data_right.width(rightAreaWidth + 18);
            }
        }
        var gvData_header_left = gvData.clone();
        gvData_header_left.find('tr:gt(0)').remove();

        var gvData_header_right = gvData_header_left.clone();
        gv_header_right.find('tr th').remove();

        gv_data_right.find('tr:eq(0)').prepend(gvData_header_left.find('th:gt(' + lockColumns + ')').clone());
        gvData_header_right.find('th:lt(' + rightCols + ')').remove();
        gvData_header_left.find('th:gt(' + leftCols + ')').remove();
        var colIndex = 0;

        function setThs(jqTr, jqHeader, isLeft) {
            //            var trHtml = '<div class="gv-div-table" style="width:' + (isLeft ? leftTableWidth : rightTableWidth) + 'px;"><div class="gv-div-tr">';
            var trHtml = '<div class="gv-div-table" style="width:' + (isLeft ? 'auto' : (rightTableWidth + 'px;')) + '"><div class="gv-div-tr">';
            jqTr.find('th').each(function (j) {
                trHtml += '<div class="gv-div-th" style="width:' + colsLengsArr[colIndex] + 'px;">';
                if (removeLeftHeaderStrBySplit != '') {
                    var splitStrs = $(this).text().split(removeLeftHeaderStrBySplit);
                    trHtml += splitStrs.length > 1 ? splitStrs[1] : splitStrs[0];
                } else if (removeRightHeaderStrBySplit != '') {
                    var splitStrs = $(this).text().split(removeRightHeaderStrBySplit);
                    trHtml += splitStrs[0];
                }
                else
                    trHtml += $(this).html();
                trHtml += '</div>';
                colIndex++;
            });
            trHtml += '</div></div>';
            jqHeader.prepend(trHtml);
        }

        //오른쪽 헤더 HTML 설정
        setThs(gvData_header_left, gv_header_left, true);
        //왼쪽 헤더 HTML 설정
        setThs(gvData_header_right, gv_header_right, false);
        //        var gvData_Data_left = $('<div class="gv-div-table" style="width:' + leftTableWidth + 'px;"></div>');
        var gvData_Data_left = $('<div class="gv-div-table" style="width:auto;"></div>');
        var gvData_Data_right = $('<div class="gv-div-table" style="width:' + rightTableWidth + 'px;"></div>');
        gvData.find("tr:gt(0)").each(function (i) {
            var tr = $(this);
            var trLeft = tr.clone();
            var trRight = tr.clone();
            trLeft.find('td:gt(' + leftCols + ')').remove();
            trRight.find('td:lt(' + rightCols + ')').remove();
            colIndex = 0;
            function setTrTds(tr_left, gvData_Data_left, tr_right, gvData_Data_right, trInfo) {
                var trLeftHtml = '<div class="gv-div-tr';
                if (rowStyle != '' && i % 2 == 0)
                    trLeftHtml += ' ' + rowStyle;
                else if (alternatingRowStyle != '' && i % 2 == 1)
                    trLeftHtml += ' ' + alternatingRowStyle;
                trLeftHtml += '">';
                var trRightHtml = trLeftHtml;
                tr_left.find('td').each(function (j) {
                    trLeftHtml += '<div class="gv-div-td" style="width:' + colsLengsArr[colIndex] + 'px;">' + $(this).html() + '</div>';
                    colIndex++;
                });
                tr_right.find('td').each(function (j) {
                    trRightHtml += '<div class="gv-div-td" style="width:' + colsLengsArr[colIndex] + 'px;">' + $(this).html() + '</div>';
                    colIndex++;
                });
                trLeftHtml += '</div>'; trRightHtml += '</div>';
                var jqLeftTrHrml = $(trLeftHtml); var jqRightTrHrml = $(trRightHtml);
                if (options.rowClick !== undefined) {
                    jqLeftTrHrml.bind('click', { tds: trInfo.find('td'), rIndex: i, isLeft: true }, options.rowClick);
                    jqRightTrHrml.bind('click', { tds: trInfo.find('td'), rIndex: i, isLeft: false }, options.rowClick);
                }
                if (hoverRowStyle != '') {
                    jqLeftTrHrml.hover(function () { jqLeftTrHrml.addClass(hoverRowStyle); jqRightTrHrml.addClass(hoverRowStyle); }, function () { jqLeftTrHrml.removeClass(hoverRowStyle); jqRightTrHrml.removeClass(hoverRowStyle); });
                    jqRightTrHrml.hover(function () { jqLeftTrHrml.addClass(hoverRowStyle); jqRightTrHrml.addClass(hoverRowStyle); }, function () { jqLeftTrHrml.removeClass(hoverRowStyle); jqRightTrHrml.removeClass(hoverRowStyle); });
                }
                gvData_Data_left.append(jqLeftTrHrml);
                gvData_Data_right.append(jqRightTrHrml);
            }
            setTrTds(trLeft, gvData_Data_left, trRight, gvData_Data_right, tr);
        });
        gv_data_left.prepend(gvData_Data_left);
        gv_data_right.prepend(gvData_Data_right);
        if (options.isHideGridView !== undefined && options.isHideGridView)
            gvData.hide();
        if (isRemoveGridView)
            gvData.remove();
        if (leftGroupCols != '' && rightGroupCols != '') {
            dataAreaHeight -= 62;
            colIndex = 0;
            function calcGroupCol(groupCols) {
                var groupThs = groupCols.find('.gv-div-th');
                groupThs.each(function (i) {
                    var col_width = 0;
                    if ($(this).attr('colspan') !== undefined) {
                        var colSpan = parseInt($(this).attr('colspan'));
                        for (var i = 0; i < colSpan; i++) {
                            col_width += colsLengsArr[colIndex];
                            colIndex++;
                        }
                        col_width += (colSpan - 1);
                    }
                    else if ($(this).attr('rowspan') !== undefined) {
                        var rowspan = parseInt($(this).attr('rowspan'));
                        col_height = rowspan * 30 + (rowspan - 1);
                        $(this).height(col_height).css('border-bottom-style', 'none');
                        col_width = colsLengsArr[colIndex];
                        if (colIndex <= leftCols)
                            gv_header_left.find('.gv-div-th').eq(colIndex).html('').css('border-top-style', 'none');
                        else if (colIndex >= rightCols)
                            gv_header_right.find('.gv-div-th').eq(colIndex - lockColumns).html('').css('border-top-style', 'none');
                        colIndex++;
                    }
                    else {
                        col_width = colsLengsArr[colIndex];
                        colIndex++;
                    }
                    $(this).width(col_width);
                });
            }
            calcGroupCol(leftGroupCols);
            calcGroupCol(rightGroupCols);

            gv_header_left.find('.gv-div-table').prepend(leftGroupCols);
            gv_header_right.find('.gv-div-table').prepend(rightGroupCols);
        }
        else
            dataAreaHeight -= 31;
        if (dataAreaHeight > 0) {
            gv_data_left.height(dataAreaHeight - 18);
            gv_data_right.height(dataAreaHeight);
        }
        //设置滚动事件
        $('.gv-data-right').scroll(function () {
            $('.gv-data-left').scrollTop($(this).scrollTop());
            $('.gv-header-right').scrollLeft($(this).scrollLeft());
        });
    }
};