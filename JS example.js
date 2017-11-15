/**
 *  @fileOverview You can see how using this code here https://bistrodengi.ru/form/?city_id=3 (Sorry for Russian language)
 *  Translate for this form https://drive.google.com/file/d/1zRS7OJ3eMeSlsT4efr6UHBYj9oV2g9_W/view?usp=sharing
 *  In this code is used MP_Products Array with list of products which will be generated in other file
 *
 *  @author       Dmitrii Karpov
 *  @year         2014
 */

if(typeof calc === "undefined") {
    function calc (elem) {
        /**
         * Getting value of param for selected or current product
         *
         * @param {string} param Name of needed param
         * @param {string} calc_product_type Product type (Cash, Card)
         * @param {string} calc_product Name of product
         */
        this.get = function (param, calc_product_type, calc_product) {
            if(MP_Products === undefined) {
                return false;
            }

            if(param === undefined) {
                return false;
            }

            if(calc_product_type === undefined) {
                calc_product_type = this.calc_product_type;
            }

            if(calc_product === undefined) {
                calc_product = this.calc_product;
            }

            if(MP_Products[calc_product_type] === undefined && MP_Products[calc_product_type][calc_product][param] === undefined && MP_Products[calc_product_type][calc_product][param] === undefined) {
                return false;
            }
            return MP_Products[calc_product_type][calc_product][param];
        }

        /**
         * Set params for loan: amount and time (TODO: Need to separate for two methods)
         *
         * @param {number} sum Value for amount
         * @param {number} time Value for time
         */
        this.setParam = function (sum, time) {
            if(sum < this.get('minSum')) {
                this.sum = this.get('minSum');
            } else {
                if(sum > this.get('maxSum')) {
                    this.sum = this.get('maxSum');
                } else {
                    this.sum = sum
                }
            }



            if(time < this.get('minTime')) {
                this.time = this.get('minTime');
            } else {
                if(time > this.get('maxTime')) {
                    this.time = this.get('maxTime');
                } else {
                    this.time = time;
                }
            }

            this.reCalc();

            this.sumSlider.slider("value", this.sum);
            this.daysSlider.slider("value", this.time);
        }

        /**
         * Calculating of last day for pay
         */
        this.calcDate = function() {
            return Math.round(new Date().getTime() / 1000) + this.time * 86400;
        }

        /**
         * Calculating of commision
         */
        this.calcCommission = function() {
            return this.time * this.get('precent') * this.sum;
        }

        /**
         * Calculating of finial amount
         */
        this.calcAmount = function() {
            return this.commission + this.sum;
        }

        /**
         * Format amount
         */
        this.formatSum = function(sum) {
            return String(sum).replace(/(\d)(?=(\d{3})+([^\d]|$))/g, '$1 ');
        }

        /**
         * Format date
         */
        this.formatDate = function(date) {
            return time_view(date);
        }

        /**
         * Recalc of all parameters
         */
        this.reCalc = function() {
            this.date = this.calcDate();
            this.commission = this.calcCommission();
            this.amount = this.calcAmount();

            this.elem.find('.val_sum').text(this.formatSum(this.sum));
            this.elem.find('.val_date').text(this.time);
            this.elem.find('.total.time').text(this.formatDate(this.date));
            this.elem.find('.total.payy').text(this.formatSum(this.roundResult(this.amount)));
            this.elem.find('.loan_amount').val(this.sum);
            this.elem.find('.loan_days').val(this.time);

            this.elem.find('.calc_sum').val(this.sum);
            this.elem.find('.calc_time').val(this.time);
            this.elem.find('.calc_product_type').val(this.calc_product_type);
            this.elem.find('.calc_product').val(this.calc_product);

            if(this.form.length > 0) {
                $('.sum_from_calc', this.form).val(this.sum);
                $('.time_from_calc', this.form).val(this.time);
                $('.commission_from_calc', this.form).val(this.commission);
                $('.amount_from_calc', this.form).val(this.amount);
                if($(elem).closest('.product_item.visible').length > 0) {
                    $('.product_from_calc', this.form).val(this.calc_product);
                }
            }
        }

        this.roundResult = function(value){
            return (String(value).indexOf('.') != -1) ? value.toFixed(1) : value;
        }

        /**
         * Init
         */
        var $this = this;
        this.elem = $(elem);
        this.form = $('form[name="SIMPLE_FORM_1"]');

        this.calc_product_type = this.elem.find('.calc_product_type').val();
        this.calc_product = this.elem.find('.calc_product').val();


        this.sum = this.elem.find('.calc_sum').val()*1;
        this.time = this.elem.find('.calc_time').val()*1;

        this.sumSliderElem = $('.cost-slide:first', this.elem);
        this.daysSliderElem = $('.cost-slide:last', this.elem);

        this.sumSlider = this.sumSliderElem.slider({
            range: "min",
            animate: true,
            min: this.get('minSum'),
            max: this.get('maxSum'),
            step: this.get('stepSum'),
            value: this.sum,
            slide: function(e,ui) {
                $this.sum = ui.value;
                $this.reCalc();
            }
        }).bind(this);

        this.daysSlider = this.daysSliderElem.slider({
            range: "min",
            animate: true,
            min: this.get('minTime'),
            max: this.get('maxTime'),
            step: this.get('stepTime'),
            value: this.time,
            slide: function(e,ui) {
                $this.time = ui.value;
                $this.reCalc();
            }
        });

        this.tabsLiElem = $('.cost-slide:last', this.elem);

        this.reCalc();

        return this;
    }
}



/**
 * Getting all found calculators on the page
 */
var calcs = {};
$(function() {
    var calcList = $('.calculator');
    calcList.each(function(i) {
        var calcItemId = $(calcList[i]).closest('.products_calc').data('calcitemid');
        var productId = $(calcList[i]).find('.calc_product').val();
        calcs[calcItemId + '-' + productId] = new calc(calcList[i]);
    });


    $('.products_calc .tabs li').on('click', function(){
        $('.product_from_calc').val($(this).data('product'));
    });

    $('.products_calc .tabs li').on('mousedown', function() {
        var sum = +$('.product_item:visible .calc_sum').val();
        var time = +$('.product_item:visible .calc_time').val();
        for(var p in calcs) {
            calcs[p].setParam(sum, time);
        };
    });
});
