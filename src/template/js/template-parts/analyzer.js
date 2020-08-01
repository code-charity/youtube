Menu.main.section.analyzer = {
    type: 'folder',
    before: '<svg stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M21.21 15.89A10 10 0 118 2.83M22 12A10 10 0 0012 2v10z"/></svg>',
    label: 'analyzer',
    class: 'satus-folder--analyzer',
    appearanceId: 'analyzer',
    
    activ_section: {
        type: 'section',
        
        analyzer_activation: {
            type: 'switch',
            label: 'activate'
        }
    },

    section: {
        type: 'section',
        style: {
            'flex-direction': 'column',
            'align-items': 'flex-start'
        },
        onrender: function() {
            var data = Satus.storage.get('analyzer') || {},
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

            var now_minutes = new Date().getMinutes();

            watch_time.innerText = Satus.locale.getMessage('watchTime') || 'watchTime';
            today_at.innerText = Satus.locale.getMessage('todayAt') + ' ' + (new Date().getHours() + ':' + (now_minutes < 10 ? '0' + now_minutes : now_minutes)) || 'todayAt';
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
            this.appendChild(top_text_container);
            top_text_container.appendChild(watch_time);
            top_text_container.appendChild(today_at);
            container.appendChild(bottom_text_container);
            this.appendChild(container);
        }
    }
};
