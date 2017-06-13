/**
*   Dependencies
*   - Jquery
*   - Bootstrap
*
*
*   Optional Dependencies
*   - chip_scanner_picker
*/
(function() {

    if (typeof window.StableTable !== "undefined") {
        return;
    }

    // Helper functions 
    function createElement(type, appendTo, attributes, text) {
        var ele = document.createElement(type);
        // ele.className = className;
        for(var attributeName in attributes) {
            var attributeValue = attributes[attributeName];
            ele.setAttribute(attributeName, attributeValue);
        }
        appendTo.appendChild(ele);

        if (text) {
            ele.innerHTML = text;
        }
        return ele;
    };

    function isEmpty(map) {
       for(var key in map) {
            if (map.hasOwnProperty(key)) {
                return false;
            }
       }
       return true;
    }

    function findHighest(object, secondLevel) {
        var max = 0;
        for (var key in object) {
            if(!object.hasOwnProperty(key)) continue;
            var obj = object[key]
            if (obj[secondLevel] > max) {
                max = obj[secondLevel];
            }
        }
        return max;
    }

    function getObjectWithSecondLevelValue(object, secondLevel, val) {
        for (var key in object) {
            if (!object.hasOwnProperty(key)) continue;
            var obj = object[key];
            if (obj[secondLevel] == val) {
                return {key: key, val: obj}
            }
        }
    }

    //eof Helper functions  
    
    // start StableTableRow
    function StableTableRow(args) {
        this.columns = args.columns;
        this.replacement = args.replacement;
        this.templatePrefix = args.templatePrefix;
        this.tableBody = args.tableBody;
        // this.info = args.chips;
        this.chips = {};
        this.hasBeenUpdated = false;
        this.enforceCommons = args.enforceCommons;
        this.errorClass = args.errorClass;
        this.templateSelector = args.templateSelector ;
        this.showChips = args.showChips;
        this.illegalChips = args.illegalChips;
        this.stableTable = args;


        this.template = $("." + this.templateSelector).clone();
        console.log(this.templateSelector);
        this.template.removeClass(this.templateSelector);
        $('#'+this.tableBody).prepend(this.template);
        var tr = this.template[0];
        tr.addEventListener("click", this.show.bind(this));

        // this.template.tr.click(this.show);
        // this.template.click(this.show);
    }

    // add a chip to row
    StableTableRow.prototype.add = function(chipKey,chip) {
        this.chips[chipKey] = chip;
        // indicate that the row has been updated(so it will be redrawn)
        this.hasBeenUpdated = true;
    };

    // check if row contains a chip
    StableTableRow.prototype.hasChip = function(chip) {
        if (chip.chip_no in this.chips) {
            return true;
        }
        return false;
    }

    // check if row has no chips
    StableTableRow.prototype.isEmpty = function() {
        // return isEmpty(this.chips);

        return Object.keys(this.chips).length === 0
    }

    // draw columns in row
    StableTableRow.prototype.draw = function() {
        if (this.isEmpty()) {
            //if there are no chips in the row remove the row
            this.removeRow();
            return false;
        }
        if (this.hasBeenUpdated === false) {
            // there is no need to draw anything
            return false;
        }

        for (var columnKey in this.columns) {
            if (!this.columns.hasOwnProperty(columnKey)) continue;
            var column = this.columns[columnKey];
            if (column.ignore === true) {
                var button = this.template.find('.'+this.templatePrefix + columnKey);
                button.unbind('click').click(this.ignoreChipsInRow.bind(this));
                continue;
            }
            if (column.fn !== undefined) {
                var button = this.template.find('.'+this.templatePrefix + columnKey);
                button.click(column.fn.bind(this));

            }
            var columnTemplate = this.template.find('.'+this.templatePrefix + columnKey);
            columnTemplate.text(this.columnInfo(column,false,columnTemplate));
            // replace the text in the td with the 
        }

        if (this.deviatesFromCommon() || this.hasIllegalChip()) {
            // when this row does not conform with the accepted values then indicate that there is an error
            this.template.addClass(this.errorClass);
        } else {
            this.template.removeClass(this.errorClass);
        }
        this.template.show();
        this.hasBeenUpdated = false;
        return true;
    };

    StableTableRow.prototype.ignoreChipsInRow = function(event) {
        event.stopPropagation();
        var notInUse = false;
        for (var key in this.chips) {
            if ( (this.chips[key].hasOwnProperty('is_in_use') && !this.chips[key].is_in_use) && (this.chips[key].hasOwnProperty('is_banned') && !this.chips[key].is_banned)
                && !this.stableTable.enforceCommons.customer_employee_id.disabled) { //allow ignoring of products that are not in employee's beholdning if they are packing PER CUSTOMER
                notInUse = true; 
                continue;
            }
            this.stableTable.ignoredChips.push(key);
            if (key in this.stableTable.ignoredChipsInformation === false) this.stableTable.ignoredChipsInformation[key] = this.chips[key];
            
        }
        if (notInUse && !this.stableTable.enforceCommons.customer_employee_id.disabled) {
            CustomAlert.show('Cannot pack item. Please return to labeling department.', 'danger')
        }
        else this.removeRow();
    }

    // When one of the enforced commons, differ from each other the one with the most chips is choosen. 
    StableTableRow.prototype.deviatesFromCommon = function() {
        for (var common in this.enforceCommons) {
            if (!this.enforceCommons.hasOwnProperty(common)) continue;
            var commonObject = this.enforceCommons[common];
            if (commonObject.acceptedValue == null || commonObject.acceptedValue == undefined || commonObject.disabled === true) {
                continue;
            }
            if (commonObject.acceptedValue != this.representativeChip()[common]) {
                return true;
            }
        }
        return false;
    }

    StableTableRow.prototype.hasIllegalChip = function() {
        var chips = this.getChipsArray();
        for (var i = chips.length - 1; i >= 0; i--) {
            var chip = chips[i];
            if (this.isIllegalChip(chip)) {
                return true;
            }
        }
        return false;
    }

    StableTableRow.prototype.isIllegalChip = function(chip) {
        if (this.illegalChips.illegalChips !== undefined) {
            if (this.illegalChips.illegalChips.indexOf(chip) !== -1) {
                return true;
            }
        }
        return false;
    }

    // get this rows chips as an array
    StableTableRow.prototype.getChipsArray = function() {
        return Object.keys(this.chips)
    }

    // remove a chip from this row
    StableTableRow.prototype.removeChip = function(chip) {
        if (this.chips[chip]) {
            delete this.chips[chip]
            this.hasBeenUpdated = true;
            return true;
        }
        return false;
    }

    // remove this row
    StableTableRow.prototype.removeRow = function() {
        $(this.template).remove();
        this.hasBeenUpdated = true;
    }

    // choose the first chip in the chips list, since they all share common attributes, it represents the values of this row
    StableTableRow.prototype.representativeChip = function() {
        for (var key in this.chips) {
            if (!this.chips.hasOwnProperty(key)) continue;
            return this.chips[key];
        }
    }

    // It is possible to configure names that either combine multiple fields or just use a single field
    // this function determines which one was selected and returns the value
    StableTableRow.prototype.columnInfo = function(column,chip,columnTemplate) {
        chip = chip || this.representativeChip();

        // if(column.total === true) {
        //     // When total = true, it returns the amount of chips in the column
        //     return this.getChipsArray().length;
        // } else if(column.text) {
        //     return column.text;
        // }else if (typeof (column.name) == "object") {
        //     // when the combined name is an object, then return the combination of the keys
        //     return this.combinedName(column,chip);
        // } else {
        //     return this.singularName(column,chip);
        // }
        console.log("chip", chip);
        if (typeof(column) === "function") {
            var dat = column(chip, this, columnTemplate);
            console.log(dat);
            return dat;
        }
    }

    // // Takes in an object and creates combines the fields based on specifications. 
    // StableTableRow.prototype.combinedName = function(column,chip) {
    //     var combinedStr = "";
        
    //     for (var i = 0; i < column.name.length; i++) {
    //         if (i != 0) {
    //             if (combinedStr) combinedStr += column.seperator ? column.seperator : '-';
    //         }
    //         var nameKey = column.name[i];
      
    //         if (!chip[nameKey]) combinedStr = '';
    //         else combinedStr += chip[nameKey];

    //         if (!chip[nameKey] && nameKey != 'employee_no') {
    //             combinedStr = this.replacement;
    //             break;
    //         }
    //     }
    //     return combinedStr;
    // }

    // // finds the singular name
    // StableTableRow.prototype.singularName = function(column,chip) {
        
    //     var str = "";
    //     if (chip !== null && chip[column.name]) {
    //         str = chip[column.name];
    //     } else {
    //         str = this.replacement;
    //     }
    //     return str;
    // }
    // TODO find a better way, the reason this was this way is that it is the only way to smuggle the context out, when the html is being serialized.
    window.outsideFunction = function(chip) {
        
    }

    // shows information about all chips in the row
    StableTableRow.prototype.show = function() {
        if (this.showChips === false) return;
        var columns = this.showChips.columns;
        if (this.showChips !== undefined && this.showChips !== null) {
            var table = document.createElement("table");
            table.className = "table table-bordered table-striped";
            table.id = "row-details";
            // create headers
            var headerTr = document.createElement("tr");
            for (var key in columns) {
                if (!columns.hasOwnProperty(key)) continue;
                var column = columns[key];
                var headerTd = document.createElement("td");
                var headerText = document.createTextNode(column.header);
                headerTd.appendChild(headerText);
                headerTr.appendChild(headerTd);                
            }
            table.appendChild(headerTr);

            for (var chipNo in this.chips) {
                var chip = this.chips[chipNo];
                var tr = document.createElement("tr");

                for (var key in columns) {
                    if (!columns.hasOwnProperty(key)) continue;
                    var column = columns[key];
                    var td = document.createElement("td");
                    if (column.ignore === true) {
                        if (!chip.is_in_use && !chip.is_banned) {
                            td.innerHTML = '';
                        }
                        else{
                            var button = document.createElement("button");
                            button.innerHTML = column.text;
                            button.className = 'btn';
                            td.appendChild(button);
                            var StableTable = this.stableTable;
                            TableRow = this; 
                            outsideFunction = function(chipN) {
                                // The reason I used this method, is that this is the only way i know to add an event listener to something that is going to be turned into html
                                $(".bootbox-tr-"+chipN).remove();
                                StableTable.ignoredChips.push(chipN);
                                if (chipN in StableTable.ignoredChipsInformation === false) StableTable.ignoredChipsInformation[chipN] = TableRow.chips[chipN];
                            }
                            tr.className = "bootbox-tr-"+chipNo;
                            button.setAttribute("onclick", "outsideFunction('"+chipNo+"')");
                        }
                    } 
                    else if(column.illegal_chip === true) {                        
                        if (this.isIllegalChip(chipNo) && !chip.is_banned){
                            //it is illegal because the product is not currently in the employeee's beholdning or the employee is ended
                            var span = document.createElement('span');
                            span.innerHTML = 'Product not in use by the employee. Please return to inventory.';
                            td.appendChild(span)
                        }
                        else if (this.isIllegalChip(chipNo)) {
                            tr.className = "bootbox-tr-"+chipNo;
                            var button = document.createElement("button");
                            button.innerHTML = column.text;
                            button.className = 'btn btn-banned';
                            td.appendChild(button);   
                            
                            var StableTable = this.stableTable;
                            var StableTableRow = this; 
                            processBannedChips = function(chip) {
                                // The reason I used this method, is that this is the only way i know to add an event listener to something that is going to be turned into html
                                var origHTML = $('tr.bootbox-tr-'+chip+ ' td:last-child').html();
                                $('tr.bootbox-tr-'+chip+ ' td:last-child').html('<img src="/images/ajax-loader.gif" alt="opdaterer...">');
                                var size = $('.bootbox-tr-'+chip).find("td").eq(2).html();  
                                var customer_id = $('.bootbox-tr-'+chip).find("td").eq(3).html().replace(/\D/g,'');  
                                var employee_id = $('.bootbox-tr-'+chip).find("td").eq(4).attr('id').replace(/\D/g,'');  
                                var variant_id = $('.bootbox-tr-'+chip).find("td").eq(1).html().split(',')[0];
                                
                                $.ajax({
                                    url: "/packing/process-banned-chips",
                                    data: {chip_no: chip, customer_id:customer_id, employee_id: employee_id, size: size, variant_id: variant_id},
                                    success: function(data) {
                                        if (data.result) {
                                            CustomAlert.show(data.message)
                                            $(".bootbox-tr-"+chip).remove(); //remove the row that is being processed
                                            //check if the order is complete
                                            if (data.order_completed) {
                                                $('table#row-details').find('tr.danger td:last-child').html(''); 
                                                $('table#row-details').find('tr.danger').removeClass('danger'); 
                                            }

                                            if (data.banned_chips) {
                                                StableTable.setIllegalChips(data.banned_chips);
                                            }

                                            // StableTable.ignoredChips.push(chip);
                                        }else {
                                            $('tr.bootbox-tr-'+chip+ ' td:last-child').html(origHTML);
                                            CustomAlert.show(data.message, 'danger')
                                        }
                                    },
                                    dataType: 'json'
                                })
                            }
                            button.setAttribute("onclick", "processBannedChips('"+chipNo+"')");

                            if (chip.is_in_use) {
                                var skpBtn = document.createElement("button");
                                skpBtn.innerHTML = 'Allow';
                                skpBtn.style.marginLeft = "10px";
                                skpBtn.className = 'btn';
                                td.appendChild(skpBtn);   

                                allowBanChipToPack = function(chip) {
                                    var indx = $.inArray(chip,StableTableRow.illegalChips.illegalChips);
                                    if (indx > -1) {
                                        StableTableRow.illegalChips.illegalChips.splice(indx, 1);
                                        $('tr.bootbox-tr-'+chip).removeClass('danger');
                                        $('tr.bootbox-tr-'+chip+ ' td:last-child').html('');
                                    }
                                }                           
                                
                                skpBtn.setAttribute("onclick", "allowBanChipToPack('"+chipNo+"')");
                            }
                        }                        
                    }
                    else {                        
                        var text = document.createTextNode(this.columnInfo(column,chip));
                        td.appendChild(text);
                        if (column.header == 'Employee') {
                            td.id = 'empid-' + chip.customer_employee_id;
                        }
                    }
                    tr.appendChild(td);
                }
                table.appendChild(tr);
                if (this.isIllegalChip(chipNo)) {
                    // when this chip does not conform with the accepted values then indicate that there is an error
                    $(tr).addClass(this.errorClass);
                }
            }
            bootbox.alert($(table).prop('outerHTML'));
        }
    }






    function StableTable(args) {
        // default configuration, does not work out of the box. 
        var stableTable = this;
        var config = {
            filter: {
                // default all filters to true
                packed: true,
                unknown: true,
                ignored: true,
            },
            // if true then skip the next row
            skipNext: false,
            // chip information that if not the same will call a provided error function
            enforceCommons: {},
            // information that should be the same for chips to be combined together
            commonForRow: {},
            // throw an error when these chips are being spotted
            illegalChips: {},
            // chips ignored by StableTable
            ignoredChips: [],
            ignoredChipsInformation: [],
            // chips packed 
            packedChips: [],
            // chips packed 
            creditedChips: [],
            // contains html object that contain information about how many chips are being seen
            updateBoxes: {},
            // if there is no data for the field what should be shown
            replacement: '-',
            // class used to indicate that there is an error on a row
            errorClass: "danger",
            // template class
            templateSelector: ".scan-template",
            // reference to itself
            stableTable: stableTable,
            // What is shown when somebody clicks on a row
            showChips: false,
            // id of the body where the chips should be appended
            tableBody: "stableTable",
            // prefix for the different tds for example lbl-chip_id
            templatePrefix: "lbl-",
            // contains information about what should be shown in the different fields
            columns: false,
            // chipScannerPicker lets you pick a chip Scanner
            chipScannerPicker: false,
            // reset button resets the scanner
            resetScannerButton: false,
            groupAllUnknown: false,
            // Config
            resetScannerButtonConfig: {
                // Url to reset chips
                url: "chips/reset",
                // Accepts function to select a custom scanner, chipScannerPicker tells it to use local chipScanner
                getScanner: "chipScannerPicker",
            },
            customFilters: [],
        }
        $.extend(config, args);
        $.extend(this, config);
        // // args stored so they can be passed to rows later
        
        // // get template
        this.rows = {};

        // // when set to true, it skips the next update 
        // this.skipNext = false;

        // this.commonViolations = [];

        // used to store which common rules are currently being violated, to prevent spamming the same error(or redraw rows without reason)
        this.commonViolations= [];
        // this.enforceCommons = args.enforceCommons || {};

        // this.commonForRow = args.commonForRow || {};

        // this.illegalChips = args.illegalChips || {};

        // args.illegalChips = this.illegalChips;

        // this.ignoredChips = [];

        // this.updateBoxes = args.updateBoxes || {};
        // window.x = this;
        this.init();
        // // used to remember all the unwanted chips, currently detected
        if (this.chipScannerPicker !== false) {
            // this.initChipScannerPicker(this.chipScannerPicker);
            this.chipScannerPicker = new ChipScannerPicker(this.chipScannerPicker);
        }
    }

    /**
    * The update function basically has 7 steps
    * 1. Store all chips currently known in a variable
    * 2. Remove all invalid chips (ignored, unknown, packed)
    * 3. Go through all the chips from the variable "newChips"
    *   3a. If they already exist remove them from the knownChips and check if they have been updated
    *   3b. If they do not exist add them to a row(or create a new if it does not yet exist)
    * 4. Delete all the chips stil in knownChips (If they are still in the known chips variable they have been removed from the scanner)
    * 5. Enforce Illegal chips (chips that )
    * 6. Let the enforceCommon function check if there are any conflicts between values that should be common
    * 7. Redraw all the rows that have been updated in any way. 
    */
    StableTable.prototype.update = function(newChips) {
        if (this.skipNext == true) {
            this.skipNext = false;
            return false;
        }

        this.resetPackedChips();
        this.reserCreditedChips();
        var knownChips = this.getAllChips();

        newChips = this.removeInvalidChips(newChips);

        for (var key in newChips) {
            var chip = newChips[key];
            var index = knownChips.indexOf(key);
            if (index == -1) {
                this.addChipToRow(key, chip);
            } else {
                this.checkForUpdates(key, chip);
                knownChips.splice(index, 1)
            }
        }

        for (var key in knownChips) {
            var chip = knownChips[key];
            this.removeChipFromRows(chip);
        }
        this.enforceIllegalChips();
        this.enforceCommon();
        this.draw();
    };

    StableTable.prototype.init = function() {
        if (this.resetScannerButton) {
            $(this.resetScannerButton).click(function() {
                var chipScanner;
                if (this.resetScannerButtonConfig.getScanner === "chipScannerPicker") {
                    chipScanner = this.chipScannerPicker.getSelectedId();
                } else {
                    if (typeof this.resetScannerButtonConfig.getScanner === "function") {
                        chipScanner = this.resetScannerButtonConfig.getScanner();
                    } else {
                        chipScanner = this.resetScannerButtonConfig.getScanner;
                    }
                }

                $.ajax({
                    url: "/chips/reset",
                    data: {scannerId: chipScanner},
                })
            }.bind(this));
        }
    }

    StableTable.prototype.resetIgnoredChips = function() {
        // remove all ignored chips 
        this.ignoredChips = [];
        this.ignoredChipsInformation = [];
    }

    StableTable.prototype.resetPackedChips = function() {
        // remove all packed chips 
        this.packedChips = [];
    }

    StableTable.prototype.reserCreditedChips = function() {
        // remove all packed chips 
        this.creditedChips = [];
    }

    // remove invalid chips, and if updateboxed are given update information
    StableTable.prototype.removeInvalidChips = function(chips) {
        var scannedChips = 0;
        var unknownChips = 0;
        var packedChips = 0;
        var ignoredChips = 0;
        var creditedChips = 0;

        for (var key in chips) {
            var chip = chips[key];

            if (chip == null && this.filter.unknown === true) {
                // check if chip is unknown
                unknownChips ++;
                delete chips[key];
                continue;
            }

            if (chip.is_missing) {
                // check if chip is unknown
                creditedChips ++;
                if (chip.chip_no in this.creditedChips === false) this.creditedChips[chip.chip_no] = chip;
                delete chips[key];
                continue;
            }

            if (chip && chip.is_scanned && chip.is_in_use && this.filter.packed === true) {
                // check if chip is packed

                var scanned_date;
                if (chip.last_scanned_at && chip.last_scanned_at.date) {
                    scanned_date = new Date(chip.last_scanned_at.date).toLocaleDateString();
                } else {
                    scanned_date = new Date(chip.last_scanned_at).toLocaleDateString();
                }
                // var today = new Date().toLocaleDateString();
                // if (scanned_date == today) {
                if (chip.chip_no in this.packedChips === false) this.packedChips[chip.chip_no] = chip;

                packedChips ++;                            
                delete chips[key];
                continue;
                // } 
            }

            if (chip && this.ignoredChips.indexOf(key) !== -1 && this.filter.ignored === true) {
                // check if chip is ignored
                ignoredChips++;
                delete chips[key];
                continue;
            }

            if (chip.hasOwnProperty('is_in_use') && !chip.is_in_use) {
                if (this.illegalChips.illegalChips && this.illegalChips.illegalChips.indexOf(chip.chip_no) < 0){
                    this.illegalChips.illegalChips.push(chip.chip_no);
                }                    
                continue; 
            }

            scannedChips++;

            // if the unknown chips have not been removed, then make sure they do not break anything
            if (chip === null) {
                chips[key] = {
                    isNull: true,
                    chip_no: key,
                }
            }
        }
        this.filters= {
            scanned: scannedChips,
            unknown: unknownChips,
            packed: packedChips,
            ignored: ignoredChips,
        }
        if (this.updateBoxes.ignored) {            
            this.updateBoxes.ignored.innerHTML = ignoredChips;
            if (ignoredChips > 0) {
                $('#ignoreBtn').addClass('blinking')
            }else {
                 $('#ignoreBtn').removeClass('blinking')
            }
        }

        if (this.updateBoxes.count) {
            this.updateBoxes.count.innerHTML = scannedChips;
        }

        if (this.updateBoxes.packed) {
            this.updateBoxes.packed.innerHTML = packedChips;
        }

        if (this.updateBoxes.credited) {
            this.updateBoxes.credited.innerHTML = creditedChips;

            if (creditedChips > 0) {
                $('#creditedBtn').addClass('blinking');
                this.sendMissingNotification(); 
            }else {
                 $('#creditedBtn').removeClass('blinking')
            }
        }

        if (this.updateBoxes.unknown) {
            this.updateBoxes.unknown.innerHTML = unknownChips;
            if (unknownChips > 0) {
                $('#unknownBtn').addClass('blinking')
            }else {
                 $('#unknownBtn').removeClass('blinking')
            }
        }

        return chips;
    }

    StableTable.prototype.enforceIllegalChips = function() {
        var detectedIllegalChips = [];
        var chips = this.getAllChips();
        
        for (var key in chips) {
            var chip = chips[key];
            if (typeof this.illegalChips.illegalChips !== "undefined" && this.illegalChips.illegalChips.indexOf(chip) !== -1) {
                detectedIllegalChips.push(chip);
            }
        }
        if (this.illegalChips.illegalChipsDetected !== undefined && this.illegalChips.illegalChipsDetected.length === 0 && this.illegalChips.onDetect !== undefined && detectedIllegalChips.length > 0) {
            this.illegalChips.onDetect(this.getInformationAboutChips(detectedIllegalChips));
            this.redrawRows();
        }
        if (detectedIllegalChips.length === 0 && this.illegalChips.illegalChipsDetected !== undefined && this.illegalChips.illegalChipsDetected.length > 0 && this.illegalChips.onLifted !== undefined) {
            // if there was an error and there is no error anymore then trigger the onLifted event
            this.illegalChips.onLifted();
            this.redrawRows();
        }
        this.illegalChips.illegalChipsDetected = detectedIllegalChips;
    }

    // accepts an array of chips and finds the relevant information about those chips
    StableTable.prototype.getInformationAboutChips = function(chips) {
        var info = []

        for (var key in this.rows) {
            var row = this.rows[key];
            for (var i = chips.length - 1; i >= 0; i--) {
                var chip = chips[i]
                if (row.chips[chip] !== undefined) {
                    info.push(row.chips[chip]);
                }
            }
        }
        return info;
    }

    StableTable.prototype.setIllegalChips = function(chips) {
        // accepts an array of chips
        if (this.illegalChips.illegalChips){
            var c = this.illegalChips.illegalChips.concat(chips);
            this.illegalChips.illegalChips = c.filter(function (item, pos) {return c.indexOf(item) == pos});
        }
        else 
            this.illegalChips.illegalChips = chips;
    }

    StableTable.prototype.getIgnoredChips = function() {
        return this.ignoredChips;
    }

    StableTable.prototype.enforceCommon = function() {
        var violations = [];
        for (var common in this.enforceCommons) {
            if (!this.enforceCommons.hasOwnProperty(common)) continue;
            
            var commonObject = this.enforceCommons[common];
            if (commonObject.disabled) {
                // If the enforce rule is disabled skip it
                continue;
            }
            var commonValue = null;
            for (var rowKey in this.rows) {
                if (!this.rows.hasOwnProperty(rowKey)) continue;
                var row = this.rows[rowKey];
                if (commonValue === null) {
                    commonValue = row.representativeChip()[common];
                    // set common value for the common object
                    this.checkForCommonChange(commonObject, row.representativeChip()[common]);
                } else if(commonValue !== row.representativeChip()[common]) {
                    violations.push(common);
                }
            }
        }

        // resolve any existing conflicts that are no longer active
        var somethingWasResolved = false;
        for (var i = this.commonViolations.length - 1; i >= 0; i--) {
            var index = violations.indexOf(this.commonViolations[i]);
            if (index === -1) {
                this.resolveCommonViolation(this.commonViolations[i]);
                somethingWasResolved = true;
            }
        }

        // enforce any new violations, or update a violation, when something was resolved
        for (var i = violations.length - 1; i >= 0; i--) {
            if (this.commonViolations.indexOf(violations[i]) == -1 || somethingWasResolved) {
                this.commonViolation(violations[i]);
            }
        }
        this.commonViolations = violations;
    }

    StableTable.prototype.checkForCommonChange = function(commonObject, value) {
        if (typeof commonObject.commonValue === "undefined") {
            if (commonObject.onCommonChange !== undefined) {
                commonObject.onCommonChange(value);
            }
        } else {
            if (commonObject.commonValue !== value && commonObject.onCommonChange !== undefined) {
                commonObject.onCommonChange(value);
            }
        }
        commonObject.commonValue = value;            
    }

    StableTable.prototype.commonViolation = function(commonViolation) {
        var common = this.enforceCommons[commonViolation];

        var order = this.getDeviationsOnCommon(commonViolation);
        common.acceptedValue = order.first[commonViolation];

        if (common.onCommonViolation != undefined) {
            common.onCommonViolation(order.first,order.second);
        }
        this.redrawRows();
    }



    // this functions counts all the chips that belong to some common group, and returns the two groups with the highest amount of chips
    StableTable.prototype.getDeviationsOnCommon = function(commonViolation) {
        var count = {}
        for (var rowKey in this.rows) {
            if(!this.rows.hasOwnProperty(rowKey)) continue;
            var row = this.rows[rowKey];
            if (!count[row.representativeChip()[commonViolation]]) {
                var c = count[row.representativeChip()[commonViolation]] = {}
                c.chip = row.representativeChip();
                c.quantity = row.getChipsArray().length;
            } else {
                var c = count[row.representativeChip()[commonViolation]];
                c.quantity += row.getChipsArray().length;
            }
        }
        var obj = {};
        var max = findHighest(count, "quantity");
        var first = getObjectWithSecondLevelValue(count, "quantity", max);
        delete count[first.key];
        max = findHighest(count, "quantity");
        var second = getObjectWithSecondLevelValue(count, "quantity", max);

        return {first: first.val.chip,second: second.val.chip}
    }

    StableTable.prototype.resolveCommonViolation = function(commonViolation) {
        var common = this.enforceCommons[commonViolation];
        // set the acceptedValue to null, to inform the rows that they are no longer restricted
        common.acceptedValue = null;

        if (common.onCommonViolationLifted !== undefined) {
            // run any defined callbacks 
            common.onCommonViolationLifted();
        }
        this.redrawRows();
    }

    // give all rows an oppurtunity to redraw
    StableTable.prototype.draw = function() {
        for (var key in this.rows) {            
            this.rows[key].draw();
        }
    }

    // generates a row key for a chip based on which groups are currently defined as being common
    StableTable.prototype.getRowKey = function(chipKey, chip) {
        var rowKey = "";
        if (this.groupAllUnknown === true && chip.isNull === true) {
            return "unknownChipGroup";
        }
        for (var i = this.commonForRow.length - 1; i >= 0; i--) {
            // parts of the keys are seperated with a "-", so they aren't accidentally equal for exsampel ((13 + 3  =  133) == (1 + 33 == 133))
            rowKey += chip[this.commonForRow[i]] + "-";
        }
        return rowKey;
    }

    // Tell all rows that something has been updated
    StableTable.prototype.redrawRows = function() {
        for (var key in this.rows) {
            this.rows[key].hasBeenUpdated = true;
        }
    }

    // Get all chips from all rows
    StableTable.prototype.getAllChips = function() {
        var chips = [];
        for(var key in this.rows) {
            if (!this.rows.hasOwnProperty(key)) continue;
            var row = this.rows[key];
            chips = chips.concat(row.getChipsArray());
        }
        return chips;
    }

    // Try to add chip to an existent row, or create a new row if it does not yet exist
    StableTable.prototype.addChipToRow = function(chipKey, chip) {
        var rowKey = this.getRowKey(chipKey, chip);
        if (this.rows[rowKey] == undefined) {
            this.rows[rowKey] = new StableTableRow(this);
        }
        var row = this.rows[rowKey];
        // add the chip to the row
        // jsonChips.push(chip.chip_no);
        row.add(chipKey, chip);
    }

    StableTable.prototype.checkForUpdates = function(chipKey, chip) {
        var rowKey = this.getRowKey(chipKey, chip);
        
        if (!(this.rows[rowKey] && this.rows[rowKey].hasChip(chip))) {
            // If the row does not have the chip, it means that we have the wrong group, which means that the chip has been updated

            // Remove the chip from wherever it is
            this.removeChipFromRows(chip.chip_no);

            // Add chip to the right group
            this.addChipToRow(chipKey, chip);
        }
    }

    // Removes a row
    StableTable.prototype.removeRow = function(key) {
        this.rows[key].removeRow();
        delete this.rows[key];
    }

    // removes a chip from whichever row it currently is in
    StableTable.prototype.removeChipFromRows = function(chip) {
        for (var key in this.rows) {
            if (this.rows[key].removeChip(chip)) {
                if (this.rows[key].isEmpty()) {
                    this.removeRow(key);
                }
                return true;
            }
        }
        return false;
    }

    StableTable.prototype.getChipScannerId = function() {
        if (this.chipScanner === false) return false;
        return this.chipScannerPicker.getSelectedId();
    }

    StableTable.prototype.showPackedChips = function() {
        var packedChips = this.packedChips; 
        if (!packedChips || Object.keys(packedChips).length <= 0) return;
        this.generateTable('Packed Chips', packedChips);
    }

    StableTable.prototype.showIgnoredChips = function() {
        var ignoredChips = this.ignoredChipsInformation; 
        if (!ignoredChips || Object.keys(ignoredChips).length <= 0) return;
        this.generateTable('Ignored Chips', ignoredChips);
    }

    StableTable.prototype.showCreditedChips = function() {
        var creditedChips = this.creditedChips; 
        if (!creditedChips || Object.keys(creditedChips).length <= 0) return;
        
        var table = document.createElement("table");
        table.className = "table table-bordered table-striped table-condensed";
        // table.id = "ignore-list";
        var thead = document.createElement("thead");
        // create headers
        var headerTr = document.createElement("tr");
        var headerTh = document.createElement("th");
        var headerText = document.createTextNode('Chip');
        headerTh.appendChild(headerText);
        headerTr.appendChild(headerTh);   

        thead.appendChild(headerTr);
        table.appendChild(thead);
        var tbody = document.createElement("tbody");
        for (var chipNo in creditedChips) {
            var tr = document.createElement("tr");
            //chip no
            var td = document.createElement("td");
            var text = document.createTextNode(chipNo);
            td.appendChild(text);
            tr.appendChild(td);
            tbody.appendChild(tr);
        }

        table.appendChild(tbody);

        this.openModal('Krediteres',table);
    }

    StableTable.prototype.printChip = function() {
        var chip_id = $(this).data('chip');
        var scannerId = $('#chip_scanner').val();
        $.ajax({
            type: "GET",
            url: '/packing/print-chip-label',
            data: {scannerId: scannerId, chip_id:chip_id},
            success: function(data) {
                if (data.success) CustomAlert.show('Printed Successfully!','success')
                else CustomAlert.show(data.message,'danger')
            },
            error: function(jqXHR, textStatus, errorThrown) {
                CustomAlert.show('There was an error in your transaction. Please contact IT.','danger')
            }
        });
    }

    StableTable.prototype.openModal = function(titleText, bodyHTML){
        var modal = $('#button-modal');
        var stableTable = this; 
        modal
        .on('show.bs.modal', function (event) {
            modal.find('.modal-title').html(titleText);
            modal.find('.modal-body').html(bodyHTML);

            if ($('.btn-print-chip')) $('.btn-print-chip').click(stableTable.printChip)
            
        })
        .modal('show')
    }

    StableTable.prototype.generateTable = function(modalTitle, chipData){
        var columns = ['Chip','Kundenr','Medarbejdernavn','Product', 'Size'];
        var table = document.createElement("table");

        if (modalTitle == 'Packed Chips') columns.push('Action');
        
        table.className = "table table-bordered table-striped";
        // table.id = "ignore-list";
        var thead = document.createElement("thead");
        // create headers
        var headerTr = document.createElement("tr");
        
        for (var key in columns) {
            if (!columns.hasOwnProperty(key)) continue;                    
            var column = columns[key];

            var headerTh = document.createElement("th");
            var headerText = document.createTextNode(column);
            headerTh.appendChild(headerText);
            headerTr.appendChild(headerTh);                
        }
        thead.appendChild(headerTr);
        table.appendChild(thead);
        var tbody = document.createElement("tbody");
        for (var chipNo in chipData) {
            var chip = chipData[chipNo];

            var tr = document.createElement("tr");

            //chip no
            var td = document.createElement("td");
            var text = document.createTextNode(chipNo);
            td.appendChild(text);
            tr.appendChild(td);

            //customer id
            var td = document.createElement("td");
            var text = document.createTextNode(chip.customer_id);
            td.appendChild(text);
            tr.appendChild(td);

            //employee
            var td = document.createElement("td");            
            var text = document.createTextNode(chip.employee_name);
            td.appendChild(text);
            tr.appendChild(td);

            //product
            var td = document.createElement("td");
            var text = document.createTextNode(chip.product_name);
            td.appendChild(text);
            tr.appendChild(td);

            //size
            var td = document.createElement("td");
            var text = document.createTextNode(chip.product_size);
            td.appendChild(text);
            tr.appendChild(td);

            if (modalTitle == 'Packed Chips') {
                var td = document.createElement("td");
                var button = document.createElement("button");
                button.innerHTML = 'Print';
                button.className = 'btn btn-print-chip';
                var chipAtt = document.createAttribute("data-chip");       // Create a "class" attribute
                chipAtt.value = chip.chip_id;                           // Set the value of the class attribute
                button.setAttributeNode(chipAtt);  
                var chipNoAtt = document.createAttribute("data-chipno");       // Create a "class" attribute
                chipNoAtt.value = chipNo;                           // Set the value of the class attribute
                button.setAttributeNode(chipNoAtt); 

                td.appendChild(button); 
                tr.appendChild(td); 
            }
                        
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);

        this.openModal(modalTitle,table);
    }


    StableTable.prototype.sendMissingNotification = function() {
        var creditedChips = [];
        for (var key in this.creditedChips) {
            creditedChips.push(key);
        } 
        var scannerId = $('#chip_scanner').val();
      
        $.ajax({
            type: "GET",
            url: '/packing/send-missing-notification',
            data: {creditedChips: creditedChips, scannerId: scannerId},
            success: function(data) {
                return true; 
            }
        });

        return true; 
    }

    window.StableTable = StableTable;
}());