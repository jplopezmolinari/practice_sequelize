'use strict';

exports.dates = {
  addDay: function(num) {
    var date = new Date();
    date.setDate(date.getDate() + num);
    return date;
  },
  tomorrow: function() {
    return this.addDay(1);
  },
  yesterday: function() {
    return this.addDay(-1);
  }
};
