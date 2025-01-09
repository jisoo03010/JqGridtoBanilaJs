/**
   2: * 本插件用于实现GridView的列锁定和表头锁定，以及表头组合
   3: * @example  $.jqGridView('<%=gvData.ClientID %>', { lockColumns: 3 });
   4: * @param String gridViewClientID GridView的客户端ID
   5: * @option Number lockColumns 锁定的列数。如果包含合并表头，请与合并表头的列数一致。
   6: * @option String leftGroupCols 左侧合并列的HTML，不设置则默认为单行表头。
   7: * @option String rightGroupCols 右侧合并列的HTML，不设置则默认为单行表头。
   8: * @option String removeLeftHeaderStrBySplit 根据分隔符移除左侧头部字符。
   9: * @option String removeRightHeaderStrBySplit 根据分隔符移除右侧头部字符。
  10: * @option String rowStyle 偶数行样式。
  11: * @option String alternatingRowStyle 奇数行样式。
  12: * @option String hoverRowStyle 悬浮行样式。
  13: * @option Bool isRemoveEmptyAndZeroCols 是否移除空列或者0列。
  14: * @option Bool isHideGridView 是否在处理后隐藏GridView。
  15: * @option Bool isRemoveGridView 是否在处理后移除GridView。
  16: * @option String emptyMessage 没有数据时显示的内容，默认为“没有数据。”。
  17: * @option event rowClick 行单击事件。
  18: * @author 雪雁 
  19: * @email codelove1314@foxmail.com    
  20: * @webSite http://www.cnblogs.com/codelove/  
  21: */
jQuery.jqGridView = function (gridViewClientID, options) {
    if (gridViewClientID !== undefined && options !== undefined) {
        function formatHeaderHtml(html) {
            return html.replace(/\<tr/g, '<div class="gv-div-tr" ').replace(/<\/tr>/g, '</div>')
            .replace(/\<th/g, '<div class="gv-div-th" ').replace(/<\/th>/g, '</div>')
            .replace(/\<td/g, '<div class="gv-div-th" ').replace(/<\/td>/g, '</div>');
        }
        //锁定的列数
        var lockColumns = options.lockColumns === undefined ? 1 : options.lockColumns;
        //左侧组合列HTML
        var leftGroupCols = $(options.leftGroupCols === undefined ? '' : formatHeaderHtml(options.leftGroupCols));
        //右侧组合列HTML
        var rightGroupCols = $(options.rightGroupCols === undefined ? '' : formatHeaderHtml(options.rightGroupCols));
        //根据分隔符移除左侧头部字符
        var removeLeftHeaderStrBySplit = options.removeLeftHeaderStrBySplit === undefined ? '' : options.removeLeftHeaderStrBySplit;
        var removeRightHeaderStrBySplit = options.removeRightHeaderStrBySplit === undefined ? '' : options.removeRightHeaderStrBySplit;
        //偶数行样式
        var rowStyle = options.rowStyle === undefined ? '' : options.rowStyle;
        //奇数行样式
        var alternatingRowStyle = options.alternatingRowStyle === undefined ? '' : options.alternatingRowStyle;
        //鼠标悬浮行样式
        var hoverRowStyle = options.hoverRowStyle === undefined ? '' : options.hoverRowStyle;
        var isSafari = $.browser.safari;
        //数据空显示内容
        var emptyMessage = options.emptyMessage === undefined ? '没有数据。' : options.emptyMessage;
        var gvData = $('#' + gridViewClientID);
        if (!gvData || gvData.length == 0) {
            console.error("GridView不存在，请检查!!!", gridViewClientID, options);
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
        //所有列宽
        var colsLengsArr = new Array();
        var colsCount = gvData.find('tr:eq(0) th').each(function (i) {
            colsLengsArr[i] = ($(this).outerWidth() + 1);
        }).length;
        if (lockColumns >= colsCount) lockColumns = colsCount;
        //左侧table宽度
        var leftTableWidth = 1;
        //右侧table宽度
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
        //右侧区域宽度
        var rightAreaWidth = gv_dataContent.width() - (leftTableWidth + 25);
        //数据区域高度
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
 
        //设置左侧头部HTML
        setThs(gvData_header_left, gv_header_left, true);
        //设置右侧头部HTML
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