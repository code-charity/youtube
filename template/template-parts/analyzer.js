Menu.main.section.analyzer = {
    type: 'folder',
    label: 'analyzer',
    icon: '<svg viewBox="0 0 24 24"><defs><path id="a" d="M0 0h24v24H0z"/></defs><defs><path id="b" d="M0 0h24v24H0z"/></defs><path d="M23 8a2 2 0 0 1-2.51 1.93l-3.56 3.55A2 2 0 0 1 15 16a2 2 0 0 1-1.93-2.52l-2.55-2.55c-.16.05-.34.07-.52.07s-.36-.02-.52-.07l-4.55 4.56A2 2 0 0 1 3 18c-1.1 0-2-.9-2-2a2 2 0 0 1 2.51-1.93l4.56-4.55A2 2 0 0 1 10 7a2 2 0 0 1 1.93 2.52l2.55 2.55c.16-.05.34-.07.52-.07s.36.02.52.07l3.55-3.56A2 2 0 0 1 21 6a2 2 0 0 1 2 2zm0 0a2 2 0 0 1-2.51 1.93l-3.56 3.55A2 2 0 0 1 15 16a2 2 0 0 1-1.93-2.52l-2.55-2.55c-.16.05-.34.07-.52.07s-.36-.02-.52-.07l-4.55 4.56A2 2 0 0 1 3 18c-1.1 0-2-.9-2-2a2 2 0 0 1 2.51-1.93l4.56-4.55A2 2 0 0 1 10 7a2 2 0 0 1 1.93 2.52l2.55 2.55c.16-.05.34-.07.52-.07s.36.02.52.07l3.55-3.56A2 2 0 0 1 21 6a2 2 0 0 1 2 2z"></svg>',

    section: {
        type: 'section',

        analyzer: {
            type: 'switch',
            label: 'analyzer',

            onclick: function() {
                if (component.dataset.value === 'true') {
                    document.querySelector('.satus').appendChild(Satus.components.dialog({
                        type: 'dialog',

                        message: {
                            type: 'text',
                            label: 'videoDescriptionWillBeExpandedToGetNameOfCategory',
                            style: {
                                'width': '100%',
                                'opacity': '.8'
                            }
                        },
                        section: {
                            type: 'section',
                            class: 'controls',
                            style: {
                                'justify-content': 'flex-end'
                            },

                            cancel: {
                                type: 'button',
                                label: 'cancel',
                                onclick: function() {
                                    let scrim = document.querySelectorAll('.satus-dialog__scrim');

                                    scrim[scrim.length - 1].click();
                                }
                            },
                            ok: {
                                type: 'button',
                                label: 'OK',
                                onclick: function() {
                                    let scrim = document.querySelectorAll('.satus-dialog__scrim');

                                    scrim[scrim.length - 1].click();
                                }
                            }
                        }
                    }));
                }
            }
        }
    },


    section_table: {
        type: 'section',
        style: {
            'flex-direction': 'column',
            'align-items': 'flex-start'
        },
        on: {
            render: function(component, key) {
                let data = Satus.storage.get('analyzer') || {},
                    all_data = {},
                    all_data_sort = [],
                    all_time_value = 0,
                    current_date = new Date().toDateString(),
                    container = document.createElement('div'),
                    top_text_container = document.createElement('div'),
                    today_at = document.createElement('div'),
                    watch_time = document.createElement('div'),
                    all_time = document.createElement('div'),
                    chart = document.createElement('div'),
                    bottom_text_container = document.createElement('div');

                container.className = 'analyzer-container';
                top_text_container.className = 'analyzer-top-text';
                watch_time.className = 'analyzer-watch-time';
                today_at.className = 'analyzer-today-at';
                all_time.className = 'analyzer-all-time';
                chart.className = 'analyzer-chart';
                bottom_text_container.className = 'analyzer-bottom';

                if (data[current_date]) {
                    for (let i in data[current_date]) {
                        if (data[current_date][i]) {
                            for (let j in data[current_date][i]) {
                                if (!all_data[j]) {
                                    all_data[j] = 0;
                                }

                                all_data[j] += data[current_date][i][j];
                            }
                        }
                    }
                }

                for (let i in all_data) {
                    all_data_sort.push([i, all_data[i]]);
                    all_time_value += all_data[i];
                }

                all_data_sort.sort(function(a, b) {
                    return b[1] - a[1];
                });

                let now_minutes = new Date().getMinutes();

                watch_time.innerText = Satus.memory.get('locale/watchTime') || 'watchTime';
                today_at.innerText = Satus.memory.get('locale/todayAt') + ' ' + (new Date().getHours() + ':' + (now_minutes < 10 ? '0' + now_minutes : now_minutes)) || 'todayAt';
                all_time.innerText = Math.floor(all_time_value / 60) + 'h ' + (all_time_value - Math.floor(all_time_value / 60) * 60) + 'm';

                let h = 0;

                for (let i = 0; i < 4; i++) {
                    let column = document.createElement('div');

                    column.className = 'analyzer-column';

                    for (let j = 0; j < 6; j++) {
                        let hours = h + ':00';

                        h++;

                        let data_column = document.createElement('div');

                        data_column.className = 'analyzer-data-column';

                        if (data[current_date] && data[current_date][hours]) {
                            for (let k in data[current_date][hours]) {
                                let block = document.createElement('div');

                                block.className = 'analyzer-data';

                                let height = data[current_date][hours][k] * 100 / 60;

                                block.title = k;
                                block.style.height = height + '%';

                                if (k === all_data_sort[0][0]) {
                                    block.className += ' first';
                                } else if (k === all_data_sort[1][0]) {
                                    block.className += ' second';
                                } else if (k === all_data_sort[2][0]) {
                                    block.className += ' third';
                                }

                                data_column.appendChild(block);
                            }
                        }

                        column.appendChild(data_column);
                    }

                    chart.appendChild(column);
                }


                for (let i = 0; i < 3; i++) {
                    if (all_data_sort[i]) {
                        let cont = document.createElement('div'),
                            label = document.createElement('div'),
                            value = document.createElement('div');

                        label.className = 'label';

                        label.innerText = all_data_sort[i][0];
                        value.innerText = Math.floor(all_data_sort[i][1] / 60) + 'h ' + (all_data_sort[i][1] - Math.floor(all_data_sort[i][1] / 60) * 60) + 'm';

                        cont.appendChild(label);
                        cont.appendChild(value);
                        bottom_text_container.appendChild(cont);
                    }
                }

                container.appendChild(all_time);
                container.appendChild(chart);
                component.appendChild(top_text_container);
                top_text_container.appendChild(watch_time);
                top_text_container.appendChild(today_at);
                container.appendChild(bottom_text_container);
                component.appendChild(container);
            }
        }
    }
};