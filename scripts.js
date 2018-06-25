"use strict";

function Calculator(form, table) {
    this.form = $(form);
    this.table = $(table);

    this.form.find('button').click($.proxy(this.update, this));
}

Calculator.prototype = {
    getParams: function() {
        this.amount = this.parseFloat(this.form.find('[name=amount]').val());
        this.interest = this.parseFloat(this.form.find('[name=interest]').val()) / 100.0;
        this.commission = this.parseFloat(this.form.find('[name=commission]').val()) / 100.0;
        this.count = parseInt(this.form.find('[name=count]').val());
        this.monthlyInterest = this.interest / 12.0;
    },
    parseFloat: function(value) {
        return parseFloat(value.replace(',', '.').replace(' ', ''));
    },
    formatFloat: function(value) {
        var s = value.toFixed(2).replace('.', ','),
            r = '',
            i,
            c,
            x;

        for(i = 0; i < s.length; ++i) {
            x = s.length - i - 3;
            c = s[i];

            if(x > 0 && x % 3 == 0 &&  i !== 0) {
                r += '.';
            }

            r += c;
        }

        return r;
    },
    update: function() {
        this.getParams();
        this.calculate();
        this.render();
    },
    renderInstalment: function(instalment) {
        var html = 
            '<tr>' +
                '<td>' + instalment.nr + '</td>' +
                '<td>' + this.formatFloat(instalment.capital) + '</td>' +
                '<td>' + this.formatFloat(instalment.interest) + '</td>' +
                '<td>' + this.formatFloat(instalment.total) + '</td>' +
            '</tr>'
        ;

        return html;
    },
    render: function() {
        var i,
            instalment,
            body = this.table.find('tbody');

        body.empty();

        for(i = 0; i < this.instalments.length; ++i) {
            instalment = this.instalments[i];
            body.append(this.renderInstalment(instalment));
        }

        this.table.find('.capital').html(this.formatFloat(this.totalCapital));
        this.table.find('.interest').html(this.formatFloat(this.totalInterest));
        this.table.find('.total').html(this.formatFloat(this.totalCost));
    }
};

function VariableCalculator(form, table) {
    Calculator.call(this, form, table);
}

VariableCalculator.prototype = $.extend({}, Calculator.prototype, {
    calculate: function() {
        this.capitalPart = this.amount / this.count;
        this.instalments = [];
        this.totalCost = 0;
        this.totalInterest = 0;
        this.totalCapital = this.amount;

        var i, 
            instalment, 
            interest, 
            total,
            remainingCapital = this.amount;
        
        for(i = 1; i <= this.count; ++i) {
            interest = remainingCapital * this.monthlyInterest;
            total = this.capitalPart + interest;
            remainingCapital -= this.capitalPart;

            this.instalments.push({
                nr: i,
                capital: this.capitalPart,
                interest: interest,
                total: total
            });

            this.totalCost += total;
            this.totalInterest += interest;
        }
    }
});

function FixedCalculator(form, table) {
    Calculator.call(this, form, table);
}

FixedCalculator.prototype = $.extend({}, Calculator.prototype, {
    calculate: function() {
        var f = Math.pow(1.0 + this.monthlyInterest, this.count),
            remainingCapital = this.amount,
            interest,
            capital,
            i;

        this.instalment = this.amount * (this.monthlyInterest * f) / (f - 1);

        this.instalments = [];
        this.totalCost = this.instalment * this.count;
        this.totalInterest = 0;
        this.totalCapital = 0;

        for(i = 1; i <= this.count; ++i) {
            interest = remainingCapital * this.monthlyInterest;
            capital = this.instalment - interest;
            remainingCapital -= capital;

            this.instalments.push({
                nr: i,
                capital: capital,
                interest: interest,
                total: this.instalment
            });

            this.totalInterest += interest;
            this.totalCapital += capital;
        }
    }
});

var variableCalculator, fixedCalculator;

$(function() {
    variableCalculator = new VariableCalculator('#form-params', '#table-variable');
    fixedCalculator = new FixedCalculator('#form-params', '#table-fixed');
});