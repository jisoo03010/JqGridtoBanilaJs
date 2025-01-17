function jqGridView(container, cfg) {
    let gridView = function() {
        return {
            build: function(div, cfg) {
                console.log("build 실행!", cfg);
                // check edit mode
                if (!cfg.editMode) return;
                if (cfg.modifiedRows != undefined) {
                    if (cfg.modifiedRows.length > 0) {
                        
                        const messagesLayer = document.querySelector(cfg.messagesLayer);

                        const gridInsertPanelBody = messagesLayer.querySelector('.gridInsertPanel_body');
                        if (gridInsertPanelBody) {
                          gridInsertPanelBody.innerHTML = `<b>${cfg.messages['saveChanges']}</b>`;
                        }
                    
                        const btnYes = messagesLayer.querySelector('#btnYes');
                        if (btnYes) {
                          btnYes.removeEventListener('click', handleYesClick);
                          btnYes.addEventListener('click', function(e) {
                            messagesLayer.style.display = 'none';
                            gridView.saveModifications(e, cfg);
                          });
                        }
                    
                        const btnNo = messagesLayer.querySelector('#btnNo');
                        if (btnNo) {
                          btnNo.removeEventListener('click', handleNoClick);
                          btnNo.addEventListener('click', function(e) {
                            messagesLayer.style.display = 'none';
                            cfg.modifiedRows = null;
                            gridView.build(cfg.table.parentElement, cfg);
                            e.preventDefault();
                          });
                        }
                    
                        messagesLayer.style.display = 'block';
                        return;
                    }
                }
                config = {
                    'width': cfg.width,
                    'url': cfg.url,
                    'minWidth': cfg.minWidth,
                    'splitBar': cfg.splitBar,
                    'headLayer': cfg.headLayer,
                    'loadingLayer': cfg.loadingLayer,
                    'filterLayer': cfg.filterLayer,
                    'editLayer': cfg.editLayer,
                    'insertLayer': cfg.insertLayer,
                    'table': cfg.table,
                    'imagesUrl': cfg.imagesUrl || '',
                    'save': cfg.save,
                    'itemInsert': cfg.itemInsert,
                    'itemDelete': cfg.itemDelete, 
                };

                if (!config.loadingLayer) {
                    console.log("테이블 생성!!!");
                
                    // div 내부 초기화
                    while (div.firstChild) {
                        div.removeChild(div.firstChild);
                    }
                
                    // 테이블 및 하위 요소 생성
                    const table = document.createElement('table');
                    const tr = document.createElement('tr');
                    const td = document.createElement('td');
                
                    tr.appendChild(td);
                    table.appendChild(tr);
                
                    // 테이블에 ID 추가
                    table.id = gridView.generateId('tab');
                    div.appendChild(table);
                
                    // config.loadingLayer에 테이블 참조 저장
                    config.loadingLayer = table;
                
                    // 'gridLoader' 클래스 추가
                    table.classList.add('gridLoader');
                
                    // 내부에 로더 이미지를 포함하는 div 생성
                    const newDiv = document.createElement('div');
                    const img = document.createElement('img');
                    img.src = `${config.imagesUrl}ajax-loader.gif`;
                    newDiv.appendChild(img);
                    td.appendChild(newDiv);
                
                    // 이벤트 리스너 추가 (selectstart, mousedown)
                    config.loadingLayer.addEventListener('selectstart', gridView.stopSelect);
                    config.loadingLayer.addEventListener('mousedown', gridView.stopSelect);
                
                    // config.loadingLayer 숨기기 (선택적으로 활성화 가능)
                    // config.loadingLayer.style.display = "none";
                
                } else {
                    console.log("이미 생성되어 있습니다.");
                }
                // parameter loading indicator
                
                if (config.loadingLayer) {
                    config.loadingLayer.style.cursor = 'default';
                    config.loadingLayer.style.width = config.width + 'px';
                
                    // 높이 계산
                    const tableWidth = config.table && config.table.offsetWidth > 50 
                        ? config.table.offsetWidth 
                        : parseInt(config.width, 10);
                    config.loadingLayer.style.height = tableWidth + 'px';
                }


                // check if main table exists yet
                if (div.querySelector("table[id^='jqGridView']")) {
                    console.log('sort할떄 됨');
                
                    let previousGrid = div.querySelector("table[id^='jqGridView']");
                
                    if (previousGrid) {
                        previousGrid.insertAdjacentElement('afterend', config.loadingLayer);
                        previousGrid.id = 'previousGrid';
                
                        previousGrid.style.display = 'none';
                
                        let messageElement = div.querySelector('#message');
                        if (messageElement) {
                            messageElement.remove();
                        }
                
                        config.loadingLayer.style.display = 'block';
                    }
                }
                // send ajax request

                //==========================
                let xml = cfg.data;
                cfg = null;
                getPrevWidths(config);
                buildSkeleton(div, config);
                buildHeader(xml, config);
                buildBody(xml, config);
                buildGridTools(xml, config);
                config.loadingLayer.style.display = 'none';
                let tableIdq = document.querySelector('#' + config.tableId);
                tableIdq.style.display = 'table';
                checkResponseState(xml, config);
                gridView.init(config);

                //==========================
                /**
                $.ajax({
                    data: cfg.data,
                    type: "get",
                    url: config.url,
                    success: function(xml) {
                        xml = dkbmcData;
                        console.log('cfg.params ==>', xml);
                        // destroy previous config object
                        cfg = null;
                        // get previous columns width
                        getPrevWidths(config);
                        // console.info('after getPrevWidths');
                        buildSkeleton(div, config);
                        buildHeader(xml, config);
                        buildBody(xml, config);
                        buildGridTools(xml, config);
                        // hide loading indicator
                        $(config.loadingLayer).hide();
                        $('#' + config.tableId).show();
                        // check response
                        checkResponseState(xml, config);
                        gridView.init(config);
                    },error(e){
                        console.log(e);
                    }
                });
                 */

                
                 function getPrevWidths(config) {
                    let table = typeof config.table === 'string' 
                        ? document.querySelector(config.table) // 문자열인 경우 DOM 요소로 변환
                        : config.table; // 이미 DOM 요소라면 그대로 사용
                
                    if (!table) {
                        console.error('Invalid table reference:', config.table);
                        return;
                    }
                
                    config.prevWidths = [];
                    let firstRow = table.querySelector('tr:first-child');
                    if (firstRow) {
                        let children = firstRow.children;
                        for (let i = 0; i < children.length; i++) {
                            let container = children[i];
                            config.prevWidths[i] = parseInt(window.getComputedStyle(container).width, 10);
                        }
                    }
                }

                function buildSkeleton(div, config) {
                    let table = document.createElement("table");
                    let newId = gridView.generateId("jqGridView");
                    config.tableId = newId;

                    table.classList.add("grid");
                    table.id = newId;
                    table.setAttribute("cellspacing", "0");
                    table.setAttribute("cellpadding", "0");
                    table.style.display = "none";
                    table.appendChild(document.createElement("thead"));
                    table.appendChild(document.createElement("tbody"));
                    table.style.width = (config.width || 800) + "px";


                    if (!div.querySelector("table#previousGrid")) {
                        table.style.display = "none";
                        div.appendChild(table);
                    
                        let img = document.createElement("img");
                        img.src = config.imagesUrl + "dirty.gif";
                        img.style.position = "absolute";
                        img.style.left = "-10px";
                        img.style.top = "-10px";
                    
                        div.appendChild(img);
                    
                        let input = document.createElement("input");
                        input.type = "hidden";
                        input.id = gridView.generateId("orderby");
                        div.appendChild(input);
                    } else {
                        const previousTable = div.querySelector("table#previousGrid");
                        if (previousTable.nextSibling) {
                            div.insertBefore(table, previousTable.nextSibling);
                        } else {
                            div.appendChild(table);
                        }
                        div.removeChild(previousTable);
                    }
                    
                }

                function buildHeader(xml, config) {
                    let tr = document.createElement('tr');
                    let thead = document.querySelector('#' + config.tableId + ' thead');
                    config.headers = [];
                
                    let headerElements = xml.querySelectorAll('header > element');
                    headerElements.forEach((headerElement, i) => {
                        let prevWidth = config.prevWidths ? config.prevWidths[i] : null;
                        config.headers[i] = {
                            title: headerElement.getAttribute('title'),
                            name: headerElement.getAttribute('name'),
                            initWidth:  headerElement.getAttribute('width'),
                            resizable: parseInt(headerElement.getAttribute('resizable') || 0, 10),
                            sortable: parseInt(headerElement.getAttribute('sortable') || 1, 10),
                            isId: parseInt(headerElement.getAttribute('isId') || 0, 10),
                            contentAlign: headerElement.getAttribute('contentAlign') || 'left',
                            editTemplateId: headerElement.getAttribute('editTemplateId'),
                            itemTemplateId: headerElement.getAttribute('itemTemplateId'),
                            order: (headerElement.getAttribute('name') === xml.querySelector('parameters > orderBy').textContent)
                                ? xml.querySelector('parameters > order').textContent
                                : 'desc'
                        };
                
                        let th = document.createElement('th');
                        let div = document.createElement('div');
                        th.appendChild(div);
                
                        div.style.overflow = 'hidden';
                        div.style.whiteSpace = 'nowrap';
                
                        if (config.headers[i].resizable === 1) {
                            let sizeDiv = document.createElement('div');
                            sizeDiv.id = gridView.generateId('size_div');
                            sizeDiv.style.float = 'right';
                            sizeDiv.classList.add('gridResizer');
                            div.insertAdjacentElement('beforebegin', sizeDiv);
                        }
                
                        div.style.textAlign = 'center';
                
                        if (config.headers[i].initWidth) {
                            th.style.width = config.headers[i].initWidth + 'px';
                        }
                
                        div.innerHTML = headerElement.getAttribute('title') || "&nbsp;";
                
                        let orderByInput = document.querySelector(
                            '#' + config.tableId + ' input[id^="orderby"]'
                        );
                        if (
                            config.headers[i].name ===
                            (orderByInput ? orderByInput.value : null)
                        ) {
                            div.style.background = `url(${config.imagesUrl}${config.headers[i].order.toLowerCase()}.gif) no-repeat center right`;
                        }
                
                        if (config.headers[i].sortable === 1) {
                            const sortDiv = document.createElement('div');
                            sortDiv.id = gridView.generateId('sort_div');
                            sortDiv.style.display = 'inline-block';
                            sortDiv.style.cursor = 'pointer';
                            sortDiv.style.float = 'right';
                
                            const sortImg = document.createElement('img');
                            sortImg.src = 'asc.gif'; 
                            sortImg.style.marginLeft = '5px';
                            sortImg.style.verticalAlign = 'middle';
                
                            sortDiv.appendChild(sortImg);
                            div.appendChild(sortDiv);
                
                            sortDiv.addEventListener('click', () => {
                                const currentOrder = config.headers[i].order || 'asc';
                                const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
                                config.headers[i].order = newOrder;
                
                                sortImg.src = newOrder + '.gif';
                            });
                        }
                
                        th.classList.add('grid_th');
                        tr.appendChild(th);
                    });
                
                    thead.appendChild(tr);
                }

                function buildBody(xml, config) {
                    config.orderBy = xml.querySelector('orderBy')?.textContent || '';
                    config.order = xml.querySelector('order')?.textContent || '';
                    config.currentPage = parseInt(xml.querySelector('currentPage')?.textContent) || 1;
                    config.totalPages = parseInt(xml.querySelector('totalPages')?.textContent) || 1;
                    config.totalItems = parseInt(xml.querySelector('totalItems')?.textContent) || 0;
                    config.pageSize = config.pageSize || 10;
                
                    const currentFilterNode = xml.querySelector('currentFilter');
                    config.currentFilter = {
                        name: currentFilterNode?.getAttribute('name') || '',
                        operator: currentFilterNode?.getAttribute('operator') || '',
                        value: currentFilterNode?.getAttribute('value') || '',
                        isQuoted: currentFilterNode?.getAttribute('isQuoted') || 0
                    };
                
                    const tbody = document.querySelector(`#${config.tableId} tbody`);
                    if (tbody) tbody.innerHTML = '';
                
                    // 현재 페이지에 해당하는 데이터 계산
                    const startIndex = (config.currentPage - 1) * config.pageSize;
                    const endIndex = Math.min(startIndex + config.pageSize, config.totalItems);
                
                    const rows = xml.querySelectorAll('rows > row');
                    config.rows = [];
                
                    for (let i = startIndex; i < endIndex; i++) {
                        const row = rows[i];
                        if (!row) continue;
                
                        const tr = document.createElement('tr');
                        config.rows[i] = {};
                
                        const cells = row.querySelectorAll('cell');
                        cells.forEach((cell) => {
                            const name = cell.getAttribute('name');
                            if (name) config.rows[i][name] = cell.textContent;
                        });
                
                        for (let j = 0; j < config.headers.length; j++) {
                            const header = config.headers[j];
                            const td = document.createElement('td');
                            const div = document.createElement('div');
                
                            div.style.textAlign = header.contentAlign;
                            div.style.overflow = 'hidden';
                            div.style.whiteSpace = 'nowrap';
                
                           
                            if (header.editTemplateId) {
                                div.style.cursor = 'pointer';
                                div.addEventListener('dblclick', buildEditTemplate);
                            }
                
                            if (header.itemTemplateId) {
                                const templateId = header.itemTemplateId;
                                const templateNode = xml.querySelector(`itemTemplates > template[id='${templateId}']`);
                                let template = templateNode?.querySelector('templatebody')?.textContent || '';
                
                                templateNode?.querySelectorAll('param').forEach((param) => {
                                    const key = param.getAttribute('key');
                                    const value = config.rows[i][param.getAttribute('value')] || '';
                                    const keyRegEx = new RegExp(`{${key}}`, 'gi');
                                    template = template.replace(keyRegEx, value);
                                });
                
                                div.innerHTML = template;
                            } else {
                                const cellData = row.querySelector(`cell[name='${header.name}']`)?.textContent || '&nbsp;';
                                div.textContent = cellData;
                            }
                
                            td.appendChild(div);
                            td.classList.add('grid_td');
                            tr.appendChild(td);
                        }
                
                        tbody.appendChild(tr);
                    }
                }
                

                function buildGridTools(xml, config) {
                    console.log('buildGridTools !!');
                
                    config.messages = {};
                    config.messages['saveChanges'] = xml.querySelector('messages > saveChanges')?.textContent.trim() || 'Save changes?';
                    config.messages['deleteLine'] = xml.querySelector('messages > deleteLine')?.textContent.trim() || 'Delete line?';
                
                    config.filters = [];
                
                    const filters = xml.querySelectorAll('filter');
                    filters.forEach((filter, i) => {
                        config.filters[i] = {
                            id: filter.getAttribute('id'),
                            value: filter.getAttribute('value'),
                            title: filter.getAttribute('title') || filter.getAttribute('value'),
                            isQuoted: filter.getAttribute('isQuoted') || 0
                        };
                
                        config.filters[i].operators = [];
                        const operators = filter.querySelectorAll('operator');
                        operators.forEach((operator, j) => {
                            config.filters[i].operators[j] = {
                                title: operator.getAttribute('title') || operator.getAttribute('value'),
                                value: operator.getAttribute('value')
                            };
                        });
                    });
                
                    config.panelEntries = [];
                    const panelEntries = xml.querySelectorAll('panelEntries > entry');
                    panelEntries.forEach((entry) => {
                        config.panelEntries.push({
                            type: entry.getAttribute('type') || 'custom',
                            value: entry.textContent.trim()
                        });
                    });
                
                    config.translations = {};
                    const translations = xml.querySelectorAll('translations > add');
                    translations.forEach((translation) => {
                        const key = translation.getAttribute('key').toLowerCase();
                        const value = translation.getAttribute('value');
                        config.translations[key] = value;
                    });
                
                    config.editTemplates = {};
                    const editTemplates = xml.querySelectorAll('editTemplates > template');
                    editTemplates.forEach((template) => {
                        const tid = template.getAttribute('id');
                        config.editTemplates[tid] = {
                            type: template.getAttribute('type')
                        };
                
                        switch (config.editTemplates[tid].type) {
                            case 'textBox':
                                break;
                
                            case 'checkBox':
                                config.editTemplates[tid].entries = [];
                                const checkBoxEntries = template.querySelectorAll('content entry');
                                checkBoxEntries.forEach((entry, j) => {
                                    config.editTemplates[tid].entries[j] = {
                                        text: entry.getAttribute('text'),
                                        value: entry.getAttribute('value')
                                    };
                                });
                                break;
                
                            case 'dropDownList':
                                config.editTemplates[tid].entries = [];
                                config.editTemplates[tid].valueColumn = template.getAttribute('valueColumn');
                                const dropDownEntries = template.querySelectorAll('content entry');
                                dropDownEntries.forEach((entry, j) => {
                                    config.editTemplates[tid].entries[j] = {
                                        text: entry.getAttribute('text') || '...',
                                        value: entry.getAttribute('value')
                                    };
                                });
                                break;
                        }
                    });
                
                    const insertTemplate = xml.querySelector('insertTemplates > template');
                    if (insertTemplate) {
                        config.insertTemplate = insertTemplate.innerHTML.trim();
                    }
                }

                function checkResponseState(xml, config) {
                    const messageLayer = config.loadingLayer.cloneNode(true);
                
                    const messageDiv = messageLayer.querySelector('div');
                    if (messageDiv) {
                        messageDiv.innerHTML = '';
                    }
                    messageLayer.id = 'message';
                
                    const gridViewData = xml.querySelector('gridViewData');
                    if (!gridViewData || gridViewData.children.length === 0) {
                        if (messageDiv) {
                            messageDiv.innerHTML = '<b style="color:red;">Error: XML data file is not well-formed !</b>';
                        }
                
                        const table = document.getElementById(config.tableId);
                        if (table) {
                            table.style.display = 'none';
                            table.insertAdjacentElement('afterend', messageLayer);
                        }
                        messageLayer.style.display = 'block';
                    }
                    else if (xml.querySelector('messages > errorMessage')?.textContent.trim().length > 0) {
                        const errorMessage = xml.querySelector('messages > errorMessage')?.textContent.trim();
                        if (messageDiv) {
                            messageDiv.textContent = errorMessage;
                        }
                
                        const table = document.getElementById(config.tableId);
                        if (table) {
                            table.style.display = 'none';
                            table.insertAdjacentElement('afterend', messageLayer);
                        }
                        messageLayer.style.display = 'block';
                    }
                    else if (xml.querySelector('parameters > totalItems')?.textContent.trim() === '0') {
                        const noResultsMessage = xml.querySelector('messages > noResultsMessage')?.textContent.trim();
                        if (messageDiv) {
                            messageDiv.textContent = noResultsMessage;
                        }
                        const table = document.getElementById(config.tableId);
                        if (table) {
                            table.style.display = 'none';
                            table.insertAdjacentElement('afterend', messageLayer);
                        }
                        messageLayer.style.display = 'block';
                    }
                }

                function buildEditTemplate(e) {
                    console.log('buildEditTemplate 실행!')
                    if (!config.editMode) {
                        let eTarget = e.target;
                        let cellIndex = eTarget.parentElement.cellIndex;
                        let rowIndex = Array.from(
                            eTarget.parentElement.parentElement.parentElement.children
                        ).indexOf(eTarget.parentElement.parentElement);
                        let template = config.editTemplates[config.headers[cellIndex].editTemplateId];
                        config.editMode = true;
                        let tmpContent = eTarget.textContent;
                        eTarget.innerHTML = '';

                        config.cancelEditMode = function (e) {
                            switch (template.type) {
                                case 'textBox': {
                                    const input = eTarget.querySelector('input');
                                    const value = input ? input.value : '';
                                    eTarget.innerHTML = ''; 
                                    eTarget.textContent = value; 
                                    break;
                                }
                        
                                case 'checkBox': {
                                    const checkBox = eTarget.querySelector('input[type="checkbox"]');
                                    const values = {};
                                    template.entries.forEach((entry) => {
                                        values[entry.value] = entry.text;
                                    });
                        
                                    eTarget.innerHTML = ''; 
                                    if (checkBox && checkBox.checked) {
                                        eTarget.textContent = values['checked'];
                                    } else {
                                        eTarget.textContent = values['unchecked'];
                                    }
                                    break;
                                }
                        
                                case 'dropDownList': {
                                    const select = eTarget.querySelector('select');
                                    if (select) {
                                        const selectedOption = select.options[select.selectedIndex];
                                        eTarget.innerHTML = '';
                                        eTarget.textContent = selectedOption ? selectedOption.text : '';
                                        if (template.valueColumn && selectedOption) {
                                            config.rows[rowIndex][template.valueColumn] = selectedOption.value;
                                        }
                                    }
                                    break;
                                }
                            }
                        
                            config.rows[rowIndex][config.headers[cellIndex].name] = eTarget.textContent.trim();
                            config.editMode = false;
                        };
                        config.startModification = function (e) {
                            if (typeof config.save === 'function') {
                                if (!config.dirties) config.dirties = { td: [], div: [] };
                        
                                const parentElement = eTarget.parentElement; 
                                gridView.showDirtyIcon(config, parentElement);
                        
                                if (!config.modifiedRows) config.modifiedRows = [];
                                config.modifiedRows[rowIndex] = rowIndex;
                            }
                        };
                        
                        const css = {
                            width: `${eTarget.offsetWidth}px`,
                            fontSize: window.getComputedStyle(eTarget).fontSize
                        };

                        switch (template.type) {
                            case 'textBox': {
                                const input = document.createElement('input');
                                input.type = 'text';
                                input.classList.add('gridInlineEditor');
                        
                                Object.assign(input.style, css);
                        
                                input.value = config.rows[rowIndex][config.headers[cellIndex].name];
                        
                                eTarget.appendChild(input);
                        
                                input.addEventListener('blur', config.cancelEditMode);
                                input.addEventListener('change', config.startModification);
                        
                                input.focus();
                                break;
                            }
                        
                            case 'checkBox': {
                                const input = document.createElement('input');
                                input.type = 'checkbox';
                        
                                Object.assign(input.style, css, { width: 'auto' });
                        
                                template.entries.forEach((entry) => {
                                    if (tmpContent.trim() === entry.text && entry.value === 'checked') {
                                        input.checked = true;
                                    }
                                });
                        
                                eTarget.appendChild(input);
                        
                                input.addEventListener('blur', config.cancelEditMode);
                                input.addEventListener('change', config.startModification);
                        
                                input.focus();
                                break;
                            }
                        
                            case 'dropDownList': {
                                const select = document.createElement('select');
                        
                                Object.assign(select.style, css, { width: `${eTarget.offsetWidth - 5}px` });
                        
                                template.entries.forEach((entry) => {
                                    const option = document.createElement('option');
                                    option.textContent = entry.text;
                                    option.value = entry.value;
                                    select.appendChild(option);
                        
                                    if (tmpContent.trim() === entry.text) {
                                        select.value = entry.value;
                                    }
                                });
                        
                                select.addEventListener('blur', config.cancelEditMode);
                                select.addEventListener('change', config.startModification);
                        
                                eTarget.appendChild(select);
                        
                                select.focus();
                                break;
                            }
                        }
                    }
                }
            },
            init: function(config) {
                
                console.log("init 실행!")
                config.table = document.getElementById(config.tableId);
                config.tableLeft = config.table.offsetLeft;
                config.tableRight = config.table.offsetLeft + parseInt(window.getComputedStyle(config.table).width, 10);

                initTable();
                initChildElements();
                config.reload = reload;

                function initChildElements() {
                    let div = null;
                    createTopPanel();
                    createBottomPanel();
                    if (!config.splitBar) {
                        div = document.createElement('div');
                        div.id = gridView.generateId('div');
                        config.table.parentElement.appendChild(div);
                        config.splitBar = div;
                        Object.assign(config.splitBar.style, {
                            cursor: 'e-resize',
                            position: 'absolute',
                            background: '#000',
                            width: '1px',
                            display: 'none'
                        });
                    }
                    if (!config.headLayer) {
                        div = document.createElement('div');
                        div.id = gridView.generateId('div');
                        config.table.parentElement.appendChild(div);
                        config.headLayer = div;


                        let tableWidth = config.table.offsetWidth;
                        let firstRowHeight = config.table.querySelector('tr:first-child').offsetHeight;
                        let tableTop = config.table.offsetTop;
                        let tableLeft = config.table.offsetLeft;
                
                        Object.assign(config.headLayer.style, {
                            background: `url(${config.imagesUrl}transparent.gif)`,
                            cursor: 'e-resize',
                            position: 'absolute',
                            width: `${tableWidth}px`,
                            height: `${firstRowHeight * 2}px`,
                            top: `${tableTop}px`,
                            left: `${tableLeft}px`,
                            display: 'none'
                        });
                    }
                    createFilterLayer();
                    createInsertLayer();
                    createMessagesLayer();
                }

                function initTable() {
                    console.log("initTable 실행!")
                    const sizeDivs = config.table.querySelectorAll('div[id^="size_div"]');
                    sizeDivs.forEach((sizeDiv, i) => {
                        let parent = sizeDiv.parentElement;
                        sizeDiv.style.height = `${parent.offsetHeight}px`;

                        const nextSibling = parent.nextElementSibling;
                        const hasNextSizeDiv = nextSibling && nextSibling.querySelector('div[id^="size_div"]');
                        if (!hasNextSizeDiv && i <= sizeDivs.length - 1) {
                            sizeDiv.style.display = 'none';
                        }
                    });


                    const gridResizers = config.table.querySelectorAll('.gridResizer');
                    gridResizers.forEach((resizer) => {
                        resizer.addEventListener('mousedown', startResize);
                    });

                    const headers = config.table.querySelectorAll('th');
                    headers.forEach((header, i) => {
                        const width = parseInt(window.getComputedStyle(header).width, 10) || header.offsetWidth;
                        const index = Array.from(header.parentElement.children).indexOf(header);
                
                        header.classList.add('grid_th_split');
                
                        if (config.headers[i]?.sortable === 1) {
                            const sortDiv = header.querySelector('div[id^="sort_div"]');
                            if (sortDiv) {
                                sortDiv.style.cursor = 'pointer';
                                sortDiv.addEventListener('click', sort);
                            }
                        }
                
                        const rows = config.table.querySelectorAll('tr');
                        rows.forEach((row) => {
                            const cell = row.children[index];
                            if (cell) {
                                cell.style.width = `${width}px`;
                            }
                        });
                    });
                    
                    const lastHeader = config.table.querySelector('th:last-child');
                    if (lastHeader) {
                        lastHeader.classList.remove('grid_th_split');
                        lastHeader.classList.add('grid_th_last');
                    }

                    const oddRows = config.table.querySelectorAll('tr:nth-child(odd)');
                    oddRows.forEach((row) => {
                        row.classList.add('grid_tr_odd');
                    });

                    const tbodyRows = config.table.querySelectorAll('tbody > tr');
                    tbodyRows.forEach((row) => {
                        row.addEventListener('mouseover', () => row.classList.add('grid_tr_hover'));
                        row.addEventListener('mouseout', () => row.classList.remove('grid_tr_hover'));
                    });

                    tbodyRows.forEach((row) => {
                        row.addEventListener('click', () => {
                            tbodyRows.forEach((r) => r.classList.remove('grid_tr_selected'));
                            row.classList.add('grid_tr_selected');
                            config.selectedRow = config.rows[row.sectionRowIndex];
                        });
                    });

                    const lastCells = config.table.querySelectorAll('td:last-child');
                    lastCells.forEach((cell) => cell.classList.add('grid_td_right'));

                    const firstHeaders = config.table.querySelectorAll('th:first-child');
                    firstHeaders.forEach((header) => header.classList.add('grid_td_left'));

                    const firstCells = config.table.querySelectorAll('td:first-child');
                    firstCells.forEach((cell) => cell.classList.add('grid_td_left'));

                    const lastRowCells = config.table.querySelectorAll('tr:last-child > td');
                    lastRowCells.forEach((cell) => cell.classList.add('grid_td_bottom'));

                    const tableParent = config.table.parentElement;
                    if (tableParent) {
                        const tables = tableParent.querySelectorAll('table');
                        tables.forEach((table) => {
                            table.style.width = `${config.table.offsetWidth}px`;
                        });
                    }

                    if (navigator.userAgent.toLowerCase().includes('window')) {
                        config.table.style.borderCollapse = 'collapse';
                    }
                }


                function createInsertLayer() {
                    console.log("createInsertLayer 실행!");
                    if (!config.insertTemplate) return;
                
                    if (config.insertLayer) {
                        config.insertLayer.remove();
                    }
                
                    const insertPanel = document.createElement('div');
                    insertPanel.id = gridView.generateId('insert_panel');

                    
                    insertPanel.style.background = `url(${config.imagesUrl}transparent.gif)`;
                    insertPanel.style.position = 'absolute';
                    insertPanel.style.display = 'none';
                    insertPanel.style.top = `${config.table.parentElement.offsetTop}px`;
                    insertPanel.style.left = `${config.table.parentElement.offsetLeft}px`;
                    insertPanel.style.height = `${config.table.parentElement.offsetHeight}px`;
                    insertPanel.style.width = `${config.table.offsetWidth}px`;
                    insertPanel.style.textAlign = 'center';
                
                    config.table.parentElement.appendChild(insertPanel);
                    config.insertLayer = insertPanel;
                
                    const insertPanelContainer = document.createElement('div');
                    insertPanelContainer.classList.add('gridInsertPanel');
                    insertPanel.appendChild(insertPanelContainer);
                
                    const insertPanelBody = document.createElement('div');
                    insertPanelBody.classList.add('gridInsertPanel_body');
                    insertPanelBody.innerHTML = config.insertTemplate || ''; 
                    insertPanelContainer.appendChild(insertPanelBody);
                
                    const footerPanel = document.createElement('div');
                    footerPanel.classList.add('gridEditPanel_footer');
                    footerPanel.style.textAlign = 'center';
                    insertPanelContainer.appendChild(footerPanel);
                
                    const okButton = document.createElement('input');
                    okButton.type = 'button';
                    okButton.value = config.translations['ok'] || 'Ok';
                    okButton.addEventListener('click', (e) => {
                        if (typeof config.itemInsert === 'function') {
                            config.itemInsert(e, insertPanelBody);
                        }
                        insertPanel.style.display = 'none';
                    });
                    footerPanel.appendChild(okButton);
                
                    const cancelButton = document.createElement('input');
                    cancelButton.type = 'button';
                    cancelButton.value = config.translations['cancel'] || 'Cancel';
                    cancelButton.addEventListener('click', () => {
                        insertPanel.style.display = 'none';
                    });
                    
                    insertPanel.style.marginTop = `${Math.round(config.insertLayer.parentElement.offsetHeight / 2) - 20}px`;
                    footerPanel.appendChild(cancelButton);
                }

                function createMessagesLayer() {
                    console.log("createMessagesLayer 실행!");
                    if (config.messagesLayer) {
                        config.messagesLayer.remove();
                    }
                
                    // 메시지 layer 생성
                    let div = document.createElement('div');
                    div.id = gridView.generateId('message_panel');
                    div.style.textAlign = 'center';
                
                    Object.assign(div.style, {
                        background: `url(${config.imagesUrl}transparent.gif)`,
                        position: 'absolute',
                        zIndex: 10000,
                        display: 'none',
                        top: `${config.table.parentElement.offsetTop}px`,
                        left: `${config.table.parentElement.offsetLeft}px`,
                        height: `${config.table.parentElement.offsetHeight}px`,
                        width: `${config.table.offsetWidth}px`
                    });
                
                    config.table.parentElement.appendChild(div);
                    config.messagesLayer = div;
                
                    let gridMessagePanel = document.createElement('div');
                    gridMessagePanel.classList.add('gridMessagePanel');
                    config.messagesLayer.appendChild(gridMessagePanel);
                
                    let bodyDiv = document.createElement('div');
                    bodyDiv.classList.add('gridMessagePanel_body');
                    Object.assign(bodyDiv.style, {
                        color: 'red',
                        marginTop: '10px',
                        marginBottom: '10px'
                    });
                    gridMessagePanel.appendChild(bodyDiv);
                
                    let footerDiv = document.createElement('div');
                    footerDiv.align = 'center';
                    footerDiv.classList.add('gridEditPanel_footer');
                    gridMessagePanel.appendChild(footerDiv);
                
                    let yesButton = document.createElement('input');
                    yesButton.id = 'btnYes';
                    yesButton.type = 'button';
                    yesButton.value = config.translations['yes'] || 'Yes';
                    footerDiv.appendChild(yesButton);
                
                    let noButton = document.createElement('input');
                    noButton.id = 'btnNo';
                    noButton.type = 'button';
                    noButton.value = config.translations['no'] || 'No';
                    noButton.addEventListener('click', function (e) {
                        config.messagesLayer.style.display = 'none';
                        config.modifiedRows = null;
                        gridView.build(config.table.parentElement, config);
                        return false;
                    });
                    footerDiv.appendChild(noButton);
                
                    gridMessagePanel.style.marginTop = `${Math.round(config.messagesLayer.parentElement.offsetHeight / 2) - 20}px`;
                }
                function createFilterLayer() {
                    if (config.filterLayer) {
                        config.filterLayer.remove();
                    }
                    let div = document.createElement('div');
                    div.id = gridView.generateId('div');
                    div.classList.add('gridFilterPanel');

                    let selectFilters = document.createElement('select');
                    selectFilters.id = gridView.generateId('sl_fl'); 

                    let option = document.createElement('option');
                    option.textContent = '...'; 
                    selectFilters.appendChild(option); 
                    
                    selectFilters.addEventListener('change', changeFilterOptions);
                    
                    for (let i = 0; i < config.filters.length; i++) {
                        option = document.createElement('option');
                        option.value = config.filters[i].value;
                        option.id = config.filters[i].id; 
                        option.textContent = config.filters[i].title; 
                        selectFilters.appendChild(option); 
                    }
                    
                    div.appendChild(selectFilters); 


                    let selectOp = document.createElement('select');
                    selectOp.id = gridView.generateId('sl_op'); 
                    div.appendChild(selectOp); 

                    
                    let input = document.createElement('input');
                    input.id = gridView.generateId('tx_flt'); 
                    input.type = 'text'; 
                    input.disabled = true; 
                    div.appendChild(input); 

                    input = document.createElement('input');
                    input.id = gridView.generateId('btn_flt'); 
                    input.type = 'button'; 
                    input.value = 'ok'; 
                    input.addEventListener('click', filter);
                    input.style.width = '40px'; 
                    div.appendChild(input); 

                    config.filterLayer = document.createElement('div');
                    Object.assign(config.filterLayer.style, {
                        position: 'absolute',
                        top: `${config.table.parentElement.offsetTop}px`,
                        left: `${config.table.parentElement.offsetLeft}px`,
                        height: `${config.table.parentElement.offsetHeight}px`,
                        width: `${config.table.offsetWidth}px`,
                        background: `url(${config.imagesUrl}transparent.gif)`,
                        display: 'none'
                    }); 

                    config.filterLayer.style.textAlign = 'center'; 
                    config.filterLayer.appendChild(div); 
                    config.table.parentElement.appendChild(config.filterLayer);
                    
                    Object.assign(div.style, {
                        opacity: '1', 
                        padding: '2px',
                        marginTop: `${Math.round(config.filterLayer.parentElement.offsetHeight / 2 - 20)}px`
                    });
                }

                function createBottomPanel() {
                    if (config.totalPages < 2) {
                        const gridFooter = config.table.parentElement.querySelector('.gridFooter');
                        if (gridFooter) {
                            gridFooter.remove();
                        }
                        return;
                    }
                    let table = document.createElement("table");
                    let tr = document.createElement("tr");
                    let td = document.createElement("td");
                    let div = document.createElement("div");

                    table.appendChild(tr); 
                    tr.appendChild(td);    
                    td.appendChild(div)

                    table.classList.add('gridFooter');
                    table.style.width = `${config.table.offsetWidth || config.table.clientWidth}px`;

                    if (config.currentPage > 3) {
                        const aFirst = document.createElement('a');
                        aFirst.textContent = config.translations['first'] || 'First'; 
                        aFirst.href = 'javascript:void(0);';
                        aFirst.addEventListener('click', () => {
                            config.page = 1;
                            serializeParams();
                            gridView.build(config.table.parentElement, config);
                        });
                        div.appendChild(aFirst); 
                        div.appendChild(document.createTextNode(' ... ')); 
                    
                        const aPrev = document.createElement('a');
                        aPrev.textContent = '<'; 
                        aPrev.href = 'javascript:void(0);';
                        aPrev.addEventListener('click', () => {
                            config.page = config.currentPage - 1;
                            serializeParams();
                            gridView.build(config.table.parentElement, config);
                        });
                        div.appendChild(aPrev);
                        div.appendChild(document.createTextNode(' '));
                    }
                    
                    if ((config.currentPage - 2) >= 1) {
                        const aPage2 = document.createElement('a');
                        aPage2.textContent = config.currentPage - 2;
                        aPage2.href = 'javascript:void(0);';
                        aPage2.addEventListener('click', () => {
                            config.page = config.currentPage - 2;
                            serializeParams();
                            gridView.build(config.table.parentElement, config);
                        });
                        div.appendChild(aPage2);
                        div.appendChild(document.createTextNode(' '));
                    }
                    
                    if ((config.currentPage - 1) >= 1) {
                        const aPage1 = document.createElement('a');
                        aPage1.textContent = config.currentPage - 1;
                        aPage1.href = 'javascript:void(0);';
                        aPage1.addEventListener('click', () => {
                            config.page = config.currentPage - 1;
                            serializeParams();
                            gridView.build(config.table.parentElement, config);
                        });
                        div.appendChild(aPage1);
                        div.appendChild(document.createTextNode(' '));
                    }
                    
                    // Current page number
                    div.appendChild(document.createTextNode(config.currentPage));
                    div.appendChild(document.createTextNode(' '));
                    
                    if ((config.currentPage + 1) <= config.totalPages) {
                        const aNext1 = document.createElement('a');
                        aNext1.textContent = config.currentPage + 1;
                        aNext1.href = 'javascript:void(0);';
                        aNext1.addEventListener('click', () => {
                            config.page = config.currentPage + 1;
                            serializeParams();
                            gridView.build(config.table.parentElement, config);
                        });
                        div.appendChild(aNext1);
                        div.appendChild(document.createTextNode(' '));
                    }
                    
                    if ((config.currentPage + 2) <= config.totalPages) {
                        const aNext2 = document.createElement('a');
                        aNext2.textContent = config.currentPage + 2;
                        aNext2.href = 'javascript:void(0);';
                        aNext2.addEventListener('click', () => {
                            config.page = config.currentPage + 2;
                            serializeParams();
                            gridView.build(config.table.parentElement, config);
                        });
                        div.appendChild(aNext2);
                        div.appendChild(document.createTextNode(' '));
                    }
                    
                    if ((config.currentPage + 3) <= config.totalPages) {
                        const aNextPage = document.createElement('a');
                        aNextPage.textContent = '>';
                        aNextPage.href = 'javascript:void(0);';
                        aNextPage.addEventListener('click', () => {
                            config.page = config.currentPage + 1;
                            serializeParams();
                            gridView.build(config.table.parentElement, config);
                        });
                        div.appendChild(aNextPage);
                        div.appendChild(document.createTextNode(' ... '));
                    
                        const aLast = document.createElement('a');
                        aLast.textContent = config.translations['last'] || 'Last';
                        aLast.href = 'javascript:void(0);';
                        aLast.addEventListener('click', () => {
                            config.page = config.totalPages;
                            serializeParams();
                            gridView.build(config.table.parentElement, config);
                        });
                        div.appendChild(aLast);
                    }
                    

                    let rgDiv = document.createElement('div');
                    rgDiv.style.float = 'right';
                    div.parentNode.insertBefore(rgDiv, div); 
                    rgDiv.appendChild(document.createTextNode(config.translations['page'] || 'Page'));
                    rgDiv.appendChild(document.createTextNode(` ${config.currentPage} `));
                    rgDiv.appendChild(document.createTextNode(config.translations['of'] || 'of'));
                    rgDiv.appendChild(document.createTextNode(` ${config.totalPages} (${config.totalItems} `));
                    rgDiv.appendChild(document.createTextNode(config.translations['items'] || 'items'));
                    rgDiv.appendChild(document.createTextNode(')'));

                    const gridFooter = config.table.parentElement.querySelector('.gridFooter');
                    if (gridFooter) {
                        gridFooter.remove(); 
                    }
                    config.table.parentElement.insertBefore(table, config.table.nextSibling); 
                }

                function createTopPanel() {
                    if (config.panelEntries.length < 1) return;
                    // create dom element
                    let table = document.createElement("table");
                    let tr = document.createElement('tr');
                    let td = document.createElement('td');
                    let content = document.createElement('div');

                    for (let i = 0; i < config.panelEntries.length; i++) {
                        let span = document.createElement('span');
                        content.appendChild(span);
                        span.style.cursor = 'pointer';

                        let img = document.createElement('img');
                        img.src = config.imagesUrl + config.panelEntries[i].type + '.gif'; // filter.gif, insert.gif, delete.gif 같은 파일을 사용
                        img.style.marginRight = '5px';
                
                        // 이미지를 span에 추가
                        span.appendChild(img);

                        bindEventByType(span, config.panelEntries[i]);
                    }
                    td.appendChild(content);
                    tr.appendChild(td);
                    table.appendChild(tr);
                    table.style.width = `${config.table.offsetWidth || config.table.clientWidth}px`;
                    table.classList.add('gridHeader');
                    table.id = gridView.generateId('tab');

                    const existingGridHeader = config.table.parentElement.querySelector('.gridHeader');
                    if (existingGridHeader) {
                        existingGridHeader.remove(); 
                    }
                    config.table.parentElement.insertBefore(table, config.table);
                    //return false;
                }

                function bindEventByType(element, entity) {
                    console.log('bindEventByType 실행!!!') // 4번 실행 됨.
                    switch (entity.type) {
                        case 'filter':
                            element.addEventListener('click', showFilterLayer); 
                            break;
                        case 'reload':
                            element.addEventListener('click', reload);
                            break;
                        case 'insert':
                            element.addEventListener('click', showInsertLayer);
                            break;
                        case 'delete':
                            if (typeof(config.itemDelete) == 'function') {
                                element.addEventListener('click', function (e) {
                                    if (!config.selectedRow) return;
                            
                                    let item = {
                                        parentRow: config.selectedRow,
                                    };

                                    const messageBody = config.messagesLayer.querySelector('.gridMessagePanel_body');
                                    if (messageBody) {
                                        messageBody.innerHTML = '';
                                        const boldText = document.createElement('b');
                                        boldText.textContent = config.messages['deleteLine'];
                                        messageBody.appendChild(boldText);
                                    }

                                    const btnYes = config.messagesLayer.querySelector('#btnYes');
                                    if (btnYes) {
                                        const newBtnYes = btnYes.cloneNode(true);
                                        btnYes.parentNode.replaceChild(newBtnYes, btnYes);
                                        newBtnYes.addEventListener('click', function (e) {
                                            config.messagesLayer.style.display = 'none'; 
                                            config.itemDelete(e, item);
                                            return false;
                                        });
                                    }


                                    const btnNo = config.messagesLayer.querySelector('#btnNo');
                                    if (btnNo) {
                                        const newBtnNo = btnNo.cloneNode(true);
                                        btnNo.parentNode.replaceChild(newBtnNo, btnNo);
                                        newBtnNo.addEventListener('click', function (e) {
                                            config.messagesLayer.style.display = 'none'; 
                                            return false;
                                        });
                                    }
                                    config.messagesLayer.style.display = '';
                                });
                            }
                            break;
                        case 'save':
                            element.addEventListener('click', function (e) {
                                gridView.saveModifications(e, config);
                            });
                            break;
                        case 'custom':
                            break;
                    }
                }

                function sort(e) {
                    console.log('Sort Click Event !! ', e.target);
                    const target = e.target;
                    const headerCell = target.closest('th'); 
                    const headerRow = headerCell.parentElement; 
                    const index = Array.from(headerRow.children).indexOf(headerCell);


                    config.orderBy = config.headers[index].name || '';
                    config.order = (config.headers[index].order.toLowerCase() == 'desc') ? 'DESC' : 'ASC';
                   
                    const orderByInput = config.table.parentElement.querySelector("input[id^='orderby']");
                    if (orderByInput) {
                        orderByInput.value = config.headers[index]?.name || '';
                    }

                    serializeParams();
                    const parentElement = config.table.parentElement;
                    gridView.build(parentElement, config);
                    return false;
                }

                function filter(e) {
                    const parentElement = e.target.closest('div'); 
                    const filterInput = parentElement.querySelector('input[id^=tx_flt]');
                    const filterSelect = parentElement.querySelector('select[id^=sl_fl]');
                    const operatorSelect = parentElement.querySelector('select[id^=sl_op]');


                    if (filterInput && filterInput.value.trim().length > 0) {
                        const index = filterSelect.selectedIndex - 1;
                        const selectedOption = filterSelect.options[filterSelect.selectedIndex];

                        config.currentFilter = {
                            name: selectedOption?.value || '',
                            operator: operatorSelect?.value || '', 
                            value: filterInput.value.trim(),
                            isQuoted: config.filters[index]?.isQuoted || 0, 
                        };

                        config.page = 1;
                        serializeParams();
                        const parentTable = config.table.parentElement; 
                        gridView.build(parentTable, config);
                    } else {
                        if (config.filterLayer) {
                            config.filterLayer.style.display = 'none';
                        }
                    }
                    return false;
                }

                function moveSizeBar(e) {
                    config.resizing = true;
                    if (e.pageX < config.ltColLimit || e.pageX > config.rgColLimit) {
                        return false;
                    } else if (e.pageX > config.tableLeft && e.pageX < config.tableRight) {
                        config.splitBar.style.left = `${e.clientX}px`;
                        return false;
                    } else {
                        stopResize(e);
                        return false;
                    }
                    return false
                }


                //사이징 클릭시 실행되는 method
                function startResize(e) {
                    console.log('편집 모드 활성화 되어 있음.!!!');
                    if (config.editMode) {
                        
                        if (typeof(config.cancelEditMode) == 'function') {
                            console.log('typeof(config.cancelEditMode) ==>', typeof(config.cancelEditMode));
                            config.cancelEditMode();
                        } else {
                            return false;
                        }
                    }

                    config.target = {
                        me: e.target,
                        parent: e.target.parentElement,
                        offsetX: gridView.getAbsoluteLeft(e.target) + e.target.offsetWidth
                    };

                    const parentElement = config.target.parent;
                    const nextSibling = parentElement.nextElementSibling;
                    config.ltColLimit = parentElement.offsetLeft + config.tableLeft + config.minWidth;
                    config.rgColLimit = nextSibling.offsetLeft +
                                        config.tableLeft +
                                        (parseInt(window.getComputedStyle(nextSibling).width, 10) - config.minWidth);
                    //$('body').css({ cursor: 'e-resize' });
                    document.body.style.cursor = 'e-resize';
                    config.splitBar.style.left = `${nextSibling.offsetLeft + config.tableLeft}px`;
                    config.splitBar.style.height = `${config.table.offsetHeight}px`;
                    
                    config.splitBar.style.top = `${config.table.offsetTop}px`;
                    config.splitBar.style.display = 'block';
                    config.headLayer.style.display = 'block';
                    document.addEventListener('mousemove', moveSizeBar);
                    document.addEventListener('mouseup', stopResize);
                    document.addEventListener('selectstart', gridView.stopSelect);
                    document.addEventListener('mousedown', gridView.stopSelect);
                    return false;
                }

                function stopResize(e) {
                    if (!config.resizing) return false;
                    resizeTableCells(e);

                    const dirtyElements = config.table.parentElement.querySelectorAll('div[id^="dirty"]');
                    dirtyElements.forEach((dirtyElement) => {
                        const relatedDiv = document.getElementById(config.dirties.div[dirtyElement.id]);
                        if (relatedDiv) {
                            dirtyElement.style.left = `${gridView.getAbsoluteLeft(relatedDiv)}px`;
                            dirtyElement.style.top = `${gridView.getAbsoluteTop(relatedDiv)}px`;
                        }
                    });
                    document.body.style.cursor = 'default'; 
                    config.splitBar.style.left = '0px';
                    config.splitBar.style.display = 'none';


                    config.headLayer.style.display = 'none';
                    config.resizing = false;

                    document.removeEventListener('mousemove', moveSizeBar);
                    document.removeEventListener('mouseup', stopResize);
                    document.removeEventListener('selectstart', gridView.stopSelect);
                    document.removeEventListener('mousedown', gridView.stopSelect);

                    return false;
                }

                function serializeParams() {
                    config.params = "";
                    config.params += "order=" + gridView.encodeUrl(config.order || 'ASC');
                    config.params += "&orderby=" + gridView.encodeUrl(config.orderBy);
                    config.params += "&page=" + gridView.encodeUrl(config.page || config.currentPage);

                    if (config.currentFilter.name)
                        config.params += "&filtername=" + gridView.encodeUrl(config.currentFilter.name);
                    if (config.currentFilter.operator)
                        config.params += "&filterop=" + gridView.encodeUrl(config.currentFilter.operator);
                    if (config.currentFilter.value)
                        config.params += "&filterval=" + gridView.encodeUrl(config.currentFilter.value);
                    if (config.currentFilter.isQuoted)
                        config.params += "&filterisq=" + gridView.encodeUrl(config.currentFilter.isQuoted);
                }

                function resizeTableCells(e) {
                    let resizable = {
                        diffWidth: 0,
                        parentNextLeft: 0,
                        parentWidth: 0,
                        splitBarLeft: 0,
                        leftWidth: 0,
                        rightWidth: 0,
                        currentIndex: 0
                    };
                    const parentElement = config.target.parent;
                    const nextElement = parentElement.nextElementSibling;

                    resizable.parentNextLeft = nextElement.offsetLeft;
                    resizable.splitBarLeft = config.splitBar.offsetLeft;
                    resizable.diffWidth = (resizable.parentNextLeft + config.tableLeft) - resizable.splitBarLeft;

                    resizable.leftWidth = parseInt(window.getComputedStyle(parentElement).width, 10);
                    resizable.rightWidth = parseInt(window.getComputedStyle(nextElement).width, 10);

                    resizable.currentIndex = Array.from(parentElement.parentElement.children).indexOf(parentElement);


                    let newLeftWidth = resizable.leftWidth - resizable.diffWidth - config.splitBar.offsetWidth;
                    let newRightWidth = resizable.rightWidth + resizable.diffWidth + config.splitBar.offsetWidth;
                

                    if (newLeftWidth < config.minWidth) {
                        resizable.diffWidth = resizable.diffWidth - (config.minWidth - newLeftWidth);
                    } else if (newRightWidth < config.minWidth) {
                        resizable.diffWidth = resizable.diffWidth + (config.minWidth - newRightWidth);
                    }
                    const rows = config.table.querySelectorAll('tr');
                    rows.forEach((row) => {
                        const cells = row.children;
                        if (cells[resizable.currentIndex]) {
                            cells[resizable.currentIndex].style.width = `${resizable.leftWidth - resizable.diffWidth - config.splitBar.offsetWidth}px`;
                        }
                        if (cells[resizable.currentIndex + 1]) {
                            cells[resizable.currentIndex + 1].style.width = `${resizable.rightWidth + resizable.diffWidth + config.splitBar.offsetWidth}px`;
                        }
                    });
                }

                function changeFilterOptions(e) {
                    console.log('e.target.selectedIndex ===!! > ');
                    let selectOp =  e.target.nextElementSibling;
                    let id = e.target.options[e.target.selectedIndex].id;
                    selectOp.innerHTML = '';
                    if (!id) {
                        const btnFilter = e.target.parentElement.querySelector("input[id^=btn_flt]");
                        const textInput = e.target.parentElement.querySelector("input[type='text']");
                
                        if (btnFilter) btnFilter.disabled = true; 
                        if (textInput) {
                            textInput.disabled = true; 
                            textInput.value = ''; 
                        }
                    } else {
                        const textInput = e.target.parentElement.querySelector("input[type='text']");
                        if (textInput) {
                            textInput.disabled = false; // 텍스트박스 활성화
                        }
                        let operators = getOperatorsByFilterId(id);

                        for (let i = 0; i < operators.length; i++) {
                            const option = document.createElement('option');
                            option.value = operators[i].value; 
                            option.textContent = operators[i].title; 
                            selectOp.appendChild(option); 
                        }
                    }
                }

                function getOperatorsByFilterId(filterId) {
                    let result = null;
                    for (let i = 0; i < config.filters.length; i++) {
                        if (config.filters[i].id == filterId) {
                            result = config.filters[i].operators;
                            break;
                        }
                    }
                    return result;
                }
                function showFilterLayer(e) {
                    config.filterLayer.style.display = 'block';
                }

                function showInsertLayer(e) {
                    config.insertLayer.style.display = 'block';
                }

                function reload(e, local) {
                    console.log('reload!!');
                    const orderByInput = document.querySelector("input[id^='orderby']");
                    if (orderByInput) {
                        orderByInput.value = '';
                    }
                    if (local === true) {
                        config.editMode = false;
                        serializeParams(); 
                    }
                
                    const parentElement = config.table.parentElement; 
                    gridView.build(parentElement, config); 
                
                    return false;
                }
            },
            generateId: function(prefix) {
                prefix = prefix || 'jquery-gen';
                let newId = prefix + '_' + (Math.round(100000 * Math.random()));
                if (document.getElementById(newId) !== null) {
                    return gridView.generateId(prefix);
                } else {
                    return newId;
                }
            },
            stopSelect: function(e) {
                return;
            },
            encodeUrl: function(str) {
                str = escape(str);
                str = str.replace(/\+/g, '%2B');
                str = str.replace(/\"/g, '%22');
                str = str.replace(/\'/g, '%27');
                str = str.replace(/\>/g, '%3E');
                str = str.replace(/\</g, '%3C');
                str = str.replace(/\=/g, '%3D');
                str = str.replace(/\!/g, '%21');
                str = str.replace(/:>/g, '%3A');
                return str;
            },
            getAbsoluteTop: function(object) {
                let top = object[0].offsetTop;
                while (object.offsetParent) {
                    object = object.offsetParent;
                    top += object[0].offsetTop;
                }
                return top
            },
            getAbsoluteLeft: function(object) {
                let left = object.offsetLeft;
                let currentElement = object.offsetParent;
                while (currentElement) {
                    left += currentElement.offsetLeft;
                    currentElement = currentElement.offsetParent; // 다음 부모로 이동
                }
                return left
            },
            showDirtyIcon: function(config, td) {
                if (!config.dirties.td[td.id]) {
                    let div = document.createElement('div');
                    div.style.zIndex = 10;
                    div.style.position = 'absolute';
                    div.style.top = `${gridView.getAbsoluteTop(td)}px`;
                    div.style.left = `${gridView.getAbsoluteLeft(td)}px`;

                    let image = document.createElement('img');
                    image.src = `${config.imagesUrl}dirty.gif`;
                    div.id = gridView.generateId('dirty');
                    td.id = gridView.generateId('td');

                    div.appendChild(image);
                    config.table.parentElement.appendChild(div);
                    config.dirties.div[div.id] = td.id;
                    config.dirties.td[td.id] = div.id;
                }
            },
            saveModifications: function(e, config) {
                console.log('save click!!');

                if (config.modifiedRows && typeof(config.save) == 'function') {
                    let rows = [];
                    Object.keys(config.modifiedRows).forEach((key) => {
                        const index = config.modifiedRows[key];
                        if (index !== undefined) {
                            rows.push(config.rows[index]);
                        }
                    });
                    config.modifiedRows = null;
                    config.save(e, rows);
                }
                return false;
            }
        }
    }();
    return (function (element) {
        const config = Object.assign({}, cfg, {
            minWidth: 50,
            tableLeft: 0,
            tableRight: 0,
            resizeLimit: 0,
            resizing: false,
            panelEntries: [
                { type: 'filter', value: 'Filter' },
                { type: 'reload', value: 'Reload' },
                { type: 'insert', value: 'Insert' },
                { type: 'delete', value: 'Delete' }
            ],
            target: null,
        });
    
        gridView.build(element, config);
    })(container);
};