Satus.components.table = function(item, key) {
    var table = document.createElement('div'),
        table_head = document.createElement('div'),
        table_body = document.createElement('div'),
        table_rows = [];

    table_head.className = 'satus-table__head';
    table_body.className = 'satus-table__body';

    for (var i = 0, l = item.columns.length; i < l; i++) {
        var col = document.createElement('div');

        item.columns[i][Object.keys(item.columns[i])[0]].onclick = function() {
            var index = [Array.prototype.indexOf.call(this.parentNode.parentNode.childNodes, this.parentNode)][0],
                table_sort = (item.columns[index][Object.keys(item.columns[index])[0]].sort || '').split('/');

            if (this.parentNode.parentNode.querySelector('.sort-asc') && this !== this.parentNode.parentNode.querySelector('.sort-asc')) {
                this.parentNode.parentNode.querySelector('.sort-asc').classList.remove('sort-asc');
            }

            if (this.parentNode.parentNode.querySelector('.sort-desc') && this !== this.parentNode.parentNode.querySelector('.sort-desc')) {
                this.parentNode.parentNode.querySelector('.sort-desc').classList.remove('sort-desc');
            }

            if (this.classList.contains('sort-desc')) {
                this.classList.remove('sort-desc');
                this.classList.add('sort-asc');
            } else if (this.classList.contains('sort-asc')) {
                this.classList.remove('sort-asc');
                this.classList.add('sort-desc');
            } else {
                this.classList.add('sort-desc');
            }

            var sorted_rows = table_rows.sort(this.classList.contains('sort-asc') ? function(a, b) {
                var a1 = a[index],
                    b1 = b[index];

                for (var i = 0, l = table_sort.length; i < l; i++) {
                    a1 = a1[table_sort[i]];
                    b1 = b1[table_sort[i]];
                }

                if (typeof a1 === 'number') {
                    return a1 - b1;
                } else if (typeof a1 === 'string') {
                    if (a1 < b1) {
                        return 1;
                    }
                    if (a1 > b1) {
                        return -1;
                    }
                } else {
                    return 0;
                }
            } : function(a, b) {
                var a1 = a[index],
                    b1 = b[index];

                for (var i = 0, l = table_sort.length; i < l; i++) {
                    a1 = a1[table_sort[i]];
                    b1 = b1[table_sort[i]];
                }

                if (typeof a1 === 'number') {
                    return b1 - a1;
                } else if (typeof a1 === 'string') {
                    if (a1 < b1) {
                        return -1;
                    }
                    if (a1 > b1) {
                        return 1;
                    }
                } else {
                    return 0;
                }
            });

            table.update(sorted_rows);
        };

        Satus.render(col, item.columns[i]);

        table_head.appendChild(col);
    }

    function update(rows) {
        this.querySelector('.satus-table__body').innerHTML = '';

        table_rows = rows;

        for (var i = 0, l = rows.length; i < l; i++) {
            var row = document.createElement('div');

            for (var j = 0, k = rows[i].length; j < k; j++) {
                var col = document.createElement('div');

                if (typeof rows[i][j] === 'object') {
                    Satus.render(col, rows[i][j]);
                }

                row.appendChild(col);
            }

            this.querySelector('.satus-table__body').appendChild(row);
        }
    }

    table.update = update;

    setTimeout(function() {
        table.update(item.rows);
        table_head.querySelector('.satus-text').click();
    });

    table.appendChild(table_head);
    table.appendChild(table_body);

    return table;
};