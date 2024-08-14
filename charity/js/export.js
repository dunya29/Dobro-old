var Export = {
    processing: false,
    exportData: [],
    exportForm: '#admin-export',
    init: function () {
        var that = this;
        this.exportBtn = $('[type="submit"]', this.exportForm)
        $(this.exportForm).submit(function(e){
            e.preventDefault();
            that.start();
        });
    },
    start: function() {
        this.exportBtn.prop('disabled', true);
        var that = this;
        $.post(
            '/actions/',
            {
                action: 'startExport',
                type: $('[name="type"]:checked', that.exportForm).val()
            },
            function (data) {
                if (data.success) {
                    that.processing = true;
                    that.exportData = [];
                    that.exportBtn.text('Обработка...');
                    Export.process();
                } else {
                    that.finish();
                }
            },
            'json'
        ).fail(function () {
            that.finish();
        })
    },
    finish: function(error = true) {
        if (error) showMessages('error', 'Произошла ошибка');
        this.exportBtn.text('Экспорт');
        this.exportBtn.prop('disabled', false);
        this.processing = false;
    },
    process: function() {
        var that = this;
        if (!this.processing) return;
        $.post(
            '/actions/',
            {
                action: 'processExport',
                type: $('[name="type"]:checked', that.exportForm).val()
            },
            function (data) {
                if (data.success) {
                    if (data.data.length > 0) {
                        that.exportData = that.exportData.concat(data.data);
                    }
                    if (!data.complete) {
                        that.exportBtn.text('Обработка...' + ' ' + Math.floor(data.processed / data.total * 100) + '%');
                        that.process();
                    } else {
                        that.finish(false);
                        var message = 'Экспортировано ' + data.processed + ' записей<br><br>';
                        var filename = "export.xlsx";
                        var ws_name = "Export";
                        var wb = XLSX.utils.book_new(), ws = XLSX.utils.aoa_to_sheet(that.exportData);
                        XLSX.utils.book_append_sheet(wb, ws, ws_name);
                        XLSX.writeFile(wb, filename);
                        that.exportData = [];
                        showMessages('info', message);
                    }
                } else {
                    that.finish();
                }
            },
            'json'
        ).fail(function () {
            that.finish();
        })
    }
}
$(document).ready(function(){
    Export.init();
});