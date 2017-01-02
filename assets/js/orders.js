;(function() {

  if ($('#Orders').length >= 0) {
    var apiData = [];
    var reportData = [];
    var apiPage = 1;
    var fields = [];
    var chosen = [];
    var FieldList = $('#FieldList');
    var ChosenList = $('#ChosenList');
    var SelectList = $('#SelectList');
    var fieldTemplate = $('#FieldTemplate').eq(0).html();
    var chosenTemplate = $('#ChosenTemplate').eq(0).html();
    var selectTemplate = $('#SelectTemplate').eq(0).html();

    init('orders');

    function init(dataType) {
      console.log('init');
      $.ajax({
        url: '/api/orders/fields',
        method: 'GET',
        success: (data) => {
          apiData = data.fields;
          render(dataType);
          setupSelect();
          setupDates();
          setupEvents();
        },
      });
    }

    function render(dataType) {
      fields = apiData[dataType].sort()
      buildFieldList();
      buildChosenList();
    }

    function buildChosenList() {
      ChosenList.empty();
      ChosenList.prepend(ejs.render(chosenTemplate, {fields: chosen}));

      $('.fi-x').on( 'click', function() {
        var t = $(this).parent().text().trim();
        $('.select-tile:contains("' + t + '")').removeClass('selected');
        if (chosen.indexOf(t) > -1) {
          chosen.splice(chosen.indexOf(t), 1);
          buildChosenList();
        }
      });

      $('.fi-arrow-up').on('click', function() {
        var t = $(this).parent().text().trim();
        var index = chosen.indexOf(t);
        if (index > 0) {
          chosen.splice(index-1, 0, chosen.splice(index, 1)[0]);
          buildChosenList();
        }
      });

      $('.fi-arrow-down').on('click', function() {
        var t = $(this).parent().text().trim();
        var index = chosen.indexOf(t);
        if (index < chosen.length) {
          chosen.splice(index+1, 0, chosen.splice(index, 1)[0]);
          buildChosenList();
        }
      });
    }

    function buildFieldList() {
      FieldList.empty();

      fields = fields.map((f)=> {
        return makeReadableKey(f);
      })

      FieldList.prepend(ejs.render(fieldTemplate, {fields: fields}));

      $('.select-tile').on( 'click', function() {
        var t = $(this).text().trim();
        $(this).addClass('selected')
        if (chosen.indexOf(t) === -1) {
          chosen.push(t);
          buildChosenList();
        }
      });
    }

    function makeReadableKey(key) {
      return key.replace(/_/g, '.').split('.').map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }).join(' ');
    }

    function makeShopifyKey(str) {
      return str.replace(/\ /g, '_').toLowerCase();
    }

    function setupDates() {
      console.log('Dates')
      var d = new Date();
      var now = new Date(d);
      d.setDate(d.getDate()-7);
      var weekAgo = d;

      console.log(now)
      console.log(weekAgo)

      $('#StartDate').val(makeDateInput(weekAgo));
      $('#EndDate').val(makeDateInput(now));
    }

    function setupSelect() {
      SelectList.empty();

      var options = Object.keys(apiData).map(function(opt) {
        return makeReadableKey(opt);
      })

      SelectList.append(ejs.render(selectTemplate, {options: options.sort()}));
      SelectList.on('click', function() {
        var t = $(this).children(":selected").text();
        console.log(makeShopifyKey(t))
        render(makeShopifyKey(t));
        chosen = [];
        buildChosenList();
      })
    }

    function setupEvents() {
      $('#SelectAll').on('click', function() {
        $('.select-tile').each(function(i, tile) {
          $(tile).addClass('selected');
          var t = $(tile).text().trim();
          if (chosen.indexOf(t) === -1) {
            chosen.push(t);
          }
        });
        buildChosenList();
      });

      $('#Reset').on('click', function() {
        $('.select-tile').each(function(i, tile) {
          $(tile).removeClass('selected');
        });
        chosen = [];
        buildChosenList();
      });

      $('#Submit').on('click', function() {
        var fields = chosen.map((c) => {
          return makeShopifyKey(c);
        }).join(',');
        getAPIData();
      });
    }

    function getAPIData() {
      var startDate = new Date($('#StartDate').val());
      var endDate = new Date($('#EndDate').val());
      $.ajax({
        url: '/api/orders/report',
        data: {
          created_at_min: startDate,
          created_at_max: endDate,
          page: apiPage},
        method: 'GET',
        success: (data) => {
          reportData = reportData.concat(data);
          $('#RecordCount').text(reportData.length + ' Records');
          if (data.length === 50) {
            apiPage++;
            setTimeout(() => {
              getAPIData();
            }, 500);

          } else {
            makeCSV(reportData);
            reportData = [];
            apiPage = 1;
          }

        },
      });
    }

    function makeDateInput(date) {
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      return date.toJSON().slice(0,10);
    }

    function getCSVHeaders(data) {
      if (data.length) {
        return Object.keys(data[0]);
      }
      return data;
    }

    function getCSVData(data) {
      return data.map((row) => {
        var arrData = [];
        for (var key in row) {
          arrData.push(row[key])
        }
        return arrData;
      });
    }

    function makeCSV(data) {
      var dataKey = $('#SelectList').val();
      var data = getKeyData(data, dataKey);
      var headers = getCSVHeaders(data);

      data = getCSVData(data);
      data.unshift(headers);
      console.log(data)

      //var data = [["name1", "city1", "some other info"], ["name2", "city2", "more info"]];
      var csvContent = "data:text/csv;charset=utf-8,";
      var dataString;
      data.forEach(function(infoArray, index){
         dataString = infoArray.join(",");
         csvContent += index < data.length ? dataString+ "\n" : dataString;
      });
      var encodedUri = encodeURI(csvContent);
      var link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      var reportName = 'NewReport.csv';
      if ($('#ReportName').val() !== '') {
        reportName = $('#ReportName').val() + '.csv';
      }

      link.setAttribute("download", reportName);
      document.body.appendChild(link); // Required for FF

      link.click();
    }

    function getKeyData(data, dataKey) {
      switch(dataKey) {
        case 'Order':
        return data;
        break;
        case 'Billing Address':
          return data.map((row) => {
            return row.billing_address;
          });
        break;
        case 'Client Details':
          return data.map((row) => {
            return row.client_details;
          });
        break;
        case 'Customer':
          return data.map((row) => {
            return row.customer;
          });
        break;
        case 'Customer Default Address':
          return data.map((row) => {
            return row.customer.default_address;
          });
        break;
        case 'Discount Codes':
          return data.map((row) => {
            console.log(row)
            return row.discount_codes;
          });
        break;
        case 'Fulfillments':
          return data.map((row) => {
            console.log(row)
            return row.fulfillments;
          });
        break;
        case 'Tax Lines':
        var arrData = [];
          data.forEach((row) => {
            console.log(row)
            row.tax_lines.forEach((tax) => {
              console.log(tax)
              arrData.push(tax);
            });
          });
          return arrData;
        break;
        case 'Refunds':
        var arrData = [];
          data.forEach((row) => {
            console.log(row)
            row.refunds.forEach((refund) => {
              console.log(refund)
              arrData.push(refund);
            });
          });
          return arrData;
        break;
        case 'Refunds Line Items':
        var arrData = [];
          data.forEach((row) => {
            console.log(row)
            row.refunds.forEach((refund) => {
              console.log(refund)
              refund.line_items.forEach((lineItem) => {
                arrData.push(lineItem);
              })
            });
          });
          return arrData;
        break;
        case 'Refunds Transactions':
        var arrData = [];
          data.forEach((row) => {
            console.log(row)
            row.refunds.forEach((refund) => {
              console.log(refund)
              refund.transactions.forEach((tx) => {
                arrData.push(tx);
              })
            });
          });
          return arrData;
        break;
        case 'Refunds Line Items Properties':
        var arrData = [];
          data.forEach((row) => {
            console.log(row)
            row.refunds.forEach((refund) => {
              console.log(refund)
              refund.line_items.forEach((lineItem) => {
                lineItem.properties.forEach((property) => {
                  arrData.push(property);
                })
              })
            });
          });
          return arrData;
        break;
        case 'Refunds Line Items Tax Lines':
        var arrData = [];
          data.forEach((row) => {
            console.log(row)
            row.refunds.forEach((refund) => {
              console.log(refund)
              refund.line_items.forEach((lineItem) => {
                lineItem.tax_lines.forEach((tax) => {
                  arrData.push(tax);
                })
              })
            });
          });
          return arrData;
        break;
        case 'Order Line Items':
        var arrData = [];
          data.forEach((row) => {
            console.log(row)
            row.line_items.forEach((lineItem) => {
              console.log(lineItem)
              arrData.push(lineItem);
            });
          });
          return arrData;
        break;
        case 'Order Line Items Properties':
        var arrData = [];
          data.forEach((row) => {
            console.log(row)
            row.line_items.forEach((lineItem) => {
              console.log(lineItem)
              lineItem.properties.forEach((property)=> {
                console.log(property)
                arrData.push(property);
              });
            });
          });
          return arrData;
        break;
        case 'Order Line Items Tax Lines':
        var arrData = [];
          data.forEach((row) => {
            console.log(row)
            row.line_items.forEach((lineItem) => {
              console.log(lineItem)
              lineItem.tax_lines.forEach((tax)=> {
                console.log(tax)
                arrData.push(tax);
              });
            });
          });
          return arrData;
        break;



        default:
        return data;
        break;
      }
    }
  }
}());
