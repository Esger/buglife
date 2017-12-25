$(function () {
    // "use strict";

    var interface = {
        canvas: document.getElementById('thetoroid'), // The canvas where life is drawn
        graphCanvas: document.getElementById('thegraph'), // The canvas where the graph is drawn
        $teller: $('#teller'),
        $cellsAlive: $('#cellsalive'),
        $speed: $('#speed'),
        $bugData: $('#bugData table'),
        $cellNutritionValue: $('.cellNutrition'),
        bugImages: [
            [$('.bug-0')[0], $('.bug_0')[0]],
            [$('.bug-1')[0], $('.bug_1')[0]]
        ],
        bugsYscale: 1,
        cellSize: 1, // Width and heigth of a cell in pixels
        dataCycle: 10,
        showGraph: false,
        showData: false,
        showIds: false,
        xScale: 2, // x scale of graph
        yScale: 1, //Ratio to apply values on y-axis

        initInterface: function () {
            this.bugsYscale = (buggers.maleCount != 0) ? Math.floor(this.graphCanvas.height / buggers.maleCount) : this.graphCanvas.height / 5;
            this.yScale = 5 * this.graphCanvas.height / conway.numberCells;
            this.$bugData.find('tbody tr').remove();
            this.clearSpace();
        },

        // Erase the canvas
        clearSpace: function () {
            var ctx = this.canvas.getContext('2d');
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        },

        // Update the counter
        updateCellularData: function () {
            this.$teller.text(conway.lifeSteps);
            this.$cellsAlive.text(conway.cellsAlive);
            this.$speed.text(conway.speed);
            controls.$bugCount.text(buggers.bugs.length);
        },

        // Fade the old screen a bit to white
        fadeCells: function () {
            var ctx = this.canvas.getContext('2d');
            if ($('.trails').is(":checked")) {
                ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
            } else {
                ctx.fillStyle = "rgb(255, 255, 255)";
            }
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        },

        // Fade the old graph a bit to white
        fadeGraph: function () {
            var ctx = this.graphCanvas.getContext('2d');
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.fillRect(0, 0, this.graphCanvas.width, this.graphCanvas.height);
        },

        // Draw the array with livecells
        drawCells: function () {
            var ctx = this.canvas.getContext('2d');
            var count;
            ctx.fillStyle = "rgb(128, 128, 0)";
            for (count in conway.liveCells) {
                ctx.fillRect(conway.liveCells[count].x * this.cellSize, conway.liveCells[count].y * this.cellSize, this.cellSize, this.cellSize);
            }
            conway.cellsAlive = conway.liveCells.length;
        },

        drawBug: function (bug) {
            var ctx = interface.canvas.getContext('2d');
            var adult = (bug.adult()) ? 1 : 0;
            var image = this.bugImages[bug.gender][adult];
            var scale = Math.max(bug.radius, bug.minRadius) / 16;
            ctx.save();
            ctx.translate(bug.x, bug.y);
            ctx.rotate(bug.direction - pi / 2);
            ctx.scale(scale, scale);
            ctx.drawImage(image, - 16, - 16);
            ctx.fillStyle = "rgb(0,0,0)";
            if (this.showData) {
                ctx.fillText(bug.id, - 6, - 2);
            }
            ctx.restore();
        },

        // Draw the array with livecells
        drawGraph: function () {
            var scaledSteps = Math.round(lifeSteps / xScale);
            if (lifeSteps % xScale == 0) {
                var ctx = graphCanvas.getContext('2d');
                ctx.fillStyle = "rgb(128, 128, 0)";
                ctx.fillRect(scaledSteps % graphCanvas.width, graphCanvas.height - cellsAlive * yScale, 1, 1);
                ctx.fillStyle = (scaledSteps % 2 == 0) ? "rgba(128,0,0,0.3)" : "rgba(0,0,0)";
                ctx.fillRect(scaledSteps % graphCanvas.width, graphCanvas.height - buggers.maleCount * 5, 1, 1);
                ctx.fillStyle = (scaledSteps % 2 == 0) ? "rgba(0,0,0)" : "rgba(0,0,128,0.3)";
                ctx.fillRect(scaledSteps % graphCanvas.width, graphCanvas.height - buggers.femaleCount * 5, 1, 1);
            }
        },

        // Uit object halen?
        showDataTable: function (bugs) {
            function color(thisBug) {
                var rgbVal;
                if (thisBug.gender == 1) {
                    if (thisBug.adult()) {
                        rgbVal = "193,39,45,0.7";
                    } else {
                        rgbVal = "193,0,0,0.7";
                    }
                } else {
                    if (thisBug.adult()) {
                        rgbVal = "0,113,188,0.7";
                    } else {
                        rgbVal = "0,0,188,0.7";
                    }
                }
                return "rgba(" + rgbVal + ")";
            }

            controls.$bugCount.text(bugs.length);
            for (var i = 0; i < bugs.length; i++) {
                var thisBug = bugs[i];
                var $oldTr = interface.$bugData.find('tr#bug' + thisBug.id);
                if (thisBug.alive) {
                    var $tr = $('<tr style="color:' + color(thisBug) + ';" id="bug' + thisBug.id + '"></tr>');
                    $tr.append('<td>' + (thisBug.id + '').substr(-4) + '</td>');
                    // $tr.append('<td>' + thisBug.gender + '</td>');
                    $tr.append('<td>' + Math.round(thisBug.fat) + '</td>');
                    // $tr.append('<td>' + thisBug.radius + '</td>');
                    // $tr.append('<td>' + thisBug.x + '</td>');
                    // $tr.append('<td>' + thisBug.y + '</td>');
                    // $tr.append('<td>' + helpers.fixedDecimals(thisBug.direction / pi, 2) + '</td>');
                    // $tr.append('<td>' + helpers.fixedDecimals(thisBug.bounceSteps) + '</td>');
                    // $tr.append('<td>' + helpers.fixedDecimals(thisBug.recoverySteps) + '</td>');
                    $tr.append('<td>' + helpers.fixedDecimals(thisBug.turnAmount) + '</td>');
                    $tr.append('<td>' + helpers.fixedDecimals(thisBug.turnSteps) + '</td>');
                    // $tr.append('<td>' + helpers.fixedDecimals(thisBug.poopSteps) + '</td>');
                    $tr.append('<td>' + thisBug.offspring + '</td>');
                    $tr.append('<td>' + thisBug.generation + '</td>');
                    $tr.append('<td class="smaller">' + thisBug.action.join(' ') + '</td>');
                    if ($oldTr.length) {
                        $oldTr.replaceWith($tr);
                    } else {
                        interface.$bugData.append($tr);
                    }
                } else {
                    $oldTr.remove();
                }
            }
            $.each(interface.$bugData.find('tr[id^="bug"]'), function () {
                var thisTr = this;
                function idMatch(bug) {
                    return 'bug' + bug.id == thisTr.id;
                }
                if (!bugs.find(idMatch)) {
                    this.remove();
                }
            });
        },

    };

    var controls = {

        $startBugCount: $('.startBugCount'),
        $bugCount: $('#bugCount'),
        $flockingDistance: $('.flockingDistance'),
        $repellingDistance: $('.repellingDistance'),

        initListeners: function () {
            $('#stepbutton').on('click', function () {
                bugLifeStep();
            });

            $('.flock').on('click', function () {
                buggers.flocking = $('.flock').is(":checked");
            });

            $('#startbutton').on('click', function () {
                startBugLife();
            });

            $('#stopbutton').on('click', function () {
                stopBugLife();
            });

            $('#randombutton').on('click', function () {
                restartBugLife();
            });

            $('#clearbutton').on('click', function () {
                clearBugLife();
            });

            $('#bugbutton').on('click', function () {
                addBugs(1);
            });

            $('#graphtoggler').on('click', function () {
                interface.showGraph = !interface.showGraph;
                $('#thegraph').toggle('slow');
            });

            // Toggle liferules checkboxes on or off
            $('#liferulestoggler').on('click', function () {
                $('#liferules').toggle('slow');
            });

            // Toggle bugrules checkboxes on or off
            $('#bugrulestoggler').on('click', function () {
                $('#bugrules').toggle('slow');
            });

            // Toggle text on or off
            $('#texttoggler').on('click', function () {
                $('#story').toggle('slow');
            });

            $('#datatoggler').on('click', function () {
                interface.showData = !interface.showData;
                $('#bugData').toggle('slow');
            });

            $('#liferules input').on('click', function () {
                conway.initLiferules();
            });

            controls.$startBugCount.val(buggers.startBugsCount);
            controls.$startBugCount.on('change', function () {
                buggers.startBugsCount = parseInt(controls.$startBugCount.val());
            });
            controls.$flockingDistance.val(buggers.flockingDistance);
            controls.$flockingDistance.on('change', function () {
                buggers.flockingDistance = parseInt(controls.$flockingDistance.val());
            });
            controls.$repellingDistance.val(buggers.repellingDistance);
            controls.$repellingDistance.on('change', function () {
                buggers.repellingDistance = parseInt(controls.$repellingDistance.val());
            });
            // init cellNutritionValue;
            interface.$cellNutritionValue.val(buggers.cellNutritionValue);
            // Life cell nutrition value updaten
            interface.$cellNutritionValue.on('change', function () {
                buggers.cellNutritionValue = parseInt(interface.$cellNutritionValue.val());
            });


            $('canvas').on('mouseover', function () {
                interface.showIds = true;
                interval = 250;
                interface.dataCycle = 1;
                stopStartBugLife();
            });

            $('canvas').on('mouseout', function () {
                interface.showIds = false;
                interval = 0;
                interface.dataCycle = 10;
                stopStartBugLife();
            });

            // Fill livecells with your own mouse drawing
            $('#thetoroid').on('click', function (event) {
                var mouseX = Math.floor((event.offsetX ? (event.offsetX) : event.pageX - this.offsetLeft) / interface.cellSize);
                var mouseY = Math.floor((event.offsetY ? (event.offsetY) : event.pageY - this.offsetTop) / interface.cellSize);
                conway.liveCells.push(conway.celXY(mouseX, mouseY));
                conway.drawCells();
                interface.updateCellularData();
            });

            // Toggle bug data on or off
            if (interface.showData) {
                $('#bugData').show();
            } else {
                $('#bugData').hide();
            }

        },

        initShortcuts: function () {
            shortcut.add("right", function () {
                bugLifeStep();
            });

            shortcut.add("up", function () {
                startBugLife();
            });

            shortcut.add("down", function () {
                stopBugLife();
            });

            shortcut.add("return", function () {
                restartBugLife();
            });

            shortcut.add("delete", function () {
                clearBugLife();
            });

            shortcut.add("caps_lock", function () {
                $('.trails').click();
            });

        },

        initControls: function () {
            this.initListeners();
            this.initShortcuts();
        }

    };

    var conway = {
        cellsAlive: 0, // Number of cells alive
        fillRatio: 20, // Percentage of available cells that will be set alive initially (20)
        newLifeCells: [],
        liferules: [],
        liveCells: [], // Array with x,y coordinates of living cells
        numberCells: 0, // Number of available cells
        spaceHeight: 0,
        spaceWidth: 0,
        speed: 0,
        startnumberLivecells: 0,
        lifeSteps: 0, // Number of iterations / steps done
        walkers: [],

        initLife: function () {
            this.spaceWidth = interface.canvas.width / interface.cellSize;
            this.spaceHeight = interface.canvas.height / interface.cellSize;
            this.numberCells = this.spaceWidth * this.spaceHeight;
            this.startnumberLivecells = this.numberCells * this.fillRatio / 100;
            this.cellsAlive = this.startnumberLivecells;
            this.liveCells = [];
            this.newLifeCells = [];
            this.neighbours = [];
            this.walkers = [
                [[1, -2], [2, -1], [-2, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [2, 1]], // right
                [[1, -1], [-1, 0], [1, 0], [0, 1], [1, 1]],   // down right
                [[0, -2], [-1, -1], [-1, 0], [-1, 1], [2, 1], [-1, 2], [0, 2], [1, 2]], // down
                [[0, -1], [-1, 0], [-1, 1], [0, 1], [1, 1]],  // down left
                [[-1, -2], [-2, -1], [-2, 0], [2, 0], [-2, 1], [-1, 1], [0, 1], [1, 1]], // left
                [[-1, -1], [0, -1], [-1, 0], [1, 0], [-1, 1]], // up left
                [[-1, -2], [0, -2], [1, -2], [-1, -1], [2, -1], [-1, 0], [-1, 1], [0, 2]], // up
                [[-1, -1], [0, -1], [1, -1], [1, 0], [0, 1]], // up right
            ];
            this.initLiferules();
            this.fillRandom();
        },

        initLiferules: function () {
            lifeSteps = 0;
            var count;
            var $checkbox;
            for (count = 0; count < 10; count++) {
                $checkbox = $('#newlife' + count);
                if ($checkbox.length) {
                    this.liferules[count] = $checkbox.is(":checked");
                } else {
                    this.liferules[count] = false;
                }
            }
            for (count = 10; count < 19; count++) {
                $checkbox = $('#staylife' + (count - 10));
                if ($checkbox.length) {
                    this.liferules[count] = $checkbox.is(":checked");
                } else {
                    this.liferules[count] = false;
                }
            }
        },

        // Put new pair of values in array
        celXY: function (x, y) {
            var cell = {
                x: x,
                y: y
            };
            return cell;
        },

        // Fill livecells with random cellxy's
        fillRandom: function () {
            var count;
            for (count = 0; count < this.startnumberLivecells; count++) {
                this.liveCells[count] = conway.celXY(Math.floor(Math.random() * this.spaceWidth), Math.floor(Math.random() * this.spaceHeight));
            }
        },

        // Calculate generations per second
        calcSpeed: function () {
            conway.speed = conway.lifeSteps - conway.prevSteps;
            conway.prevSteps = conway.lifeSteps;
        },

        // Set all neighbours to zero
        zeroNeighbours: function () {
            var count;
            for (count = 0; count < this.numberCells; count++) {
                this.neighbours[count] = 0;
            }
        },

        // Tell neighbours around livecells they have a neighbour
        countNeighbours: function () {
            var count, thisx, thisy, dx, dy;
            for (count in this.liveCells) {
                thisx = this.liveCells[count].x;
                thisy = this.liveCells[count].y;
                for (dy = -1; dy < 2; dy++) {
                    for (dx = -1; dx < 2; dx++) {
                        this.neighbours[((thisy + dy) * this.spaceWidth + thisx + dx + this.numberCells) % this.numberCells] += 1;
                    }
                }
                this.neighbours[thisy * this.spaceWidth + thisx] += 9;
            }
        },

        // Evaluate neighbourscounts for new livecells
        evalNeighbours: function () {
            var count;
            var self = this;

            function livecell() {
                var y = Math.floor(count / self.spaceWidth);
                var x = count - (y * self.spaceWidth);
                if (!buggers.eaten(x, y)) {
                    self.liveCells.push(conway.celXY(x, y));
                }
            }

            this.liveCells = [];
            for (count = 0; count < this.numberCells; count++) {
                if (this.liferules[this.neighbours[count]]) {
                    livecell();
                }
            }
        },

        // Scatter the bug's fat around into lifecells
        scatter: function (bug) {
            var r, angle, x, y,
                graveRadius = 50;
            for (var i = bug.fat * buggers.graveMultiplier; i > 0; i--) {
                r = Math.random() * graveRadius + bug.maxRadius;
                angle = Math.random() * 2 * pi;
                x = helpers.xWrap(bug.radius + Math.round(bug.x + Math.cos(angle) * r));
                y = helpers.yWrap(bug.radius + Math.round(bug.y + Math.sin(angle) * r));
                conway.newLifeCells.push(conway.celXY(x, y));
            }
            bug.fat = 0;
        },

        addGlider: function (bug) {
            var poo = {},
                // determine glider with opposite direction of bug
                pooDirection = Math.round(((bug.direction + pi) % (2 * pi)) / pi * 4) % 8;
            cells = [];
            // console.log(pooDirection);
            poo.x = Math.round(Math.cos(bug.direction + pi) * (bug.radius + 2) + bug.x);
            poo.y = Math.round(Math.sin(bug.direction + pi) * (bug.radius + 2) + bug.y);
            cells = $.extend(true, {}, conway.walkers[pooDirection]); // deep copy
            for (var key in cells) {
                if (cells.hasOwnProperty(key)) {
                    var cell = cells[key];
                    cell[0] = helpers.xWrap(cell[0] + poo.x);
                    cell[1] = helpers.yWrap(cell[1] + poo.y);
                    conway.newLifeCells.push(conway.celXY(cell[0], cell[1]));
                }
            }
        },

        addNewLifeCells: function () {
            if (this.newLifeCells.length) {
                this.liveCells = this.liveCells.concat(this.newLifeCells);
                this.newLifeCells = [];
            }
        },

    };

    var buggers = {
        adultFat: 1500,
        bugId: 1,
        bugs: [],
        cellNutritionValue: 3,
        flocking: $('.flock').is(":checked"),
        deadBugs: [],
        graveMultiplier: 10,
        flockingDistance: 50, // this.flockingDistance;
        repellingDistance: 5,
        maxBugsCount: 25,
        maxBugSteps: 10000,
        minBugFat: 100,
        neighbours: [], // Array with neighbours count
        newBornSteps: 500,
        pregnancySteps: 100,
        startBugsCount: 17,

        get maleCount() {
            return this.bugs.filter(function (bug, i, bugs) {
                return bug.gender == 1;
            }).length;
        },

        get femaleCount() {
            return this.bugs.length - this.maleCount;
        },

        initBugs: function () {
            this.bugId = 1;
            buggers.bugs = [];
            this.deadBugs = [];
            this.addBugs(this.startBugsCount);
        },

        // Draw the bugs
        drawBugs: function () {
            var thisBug;
            for (var i = 0; i < buggers.bugs.length; i++) {
                thisBug = buggers.bugs[i];
                interface.drawBug(thisBug);
            }
        },

        // Change gender of a bug if only one gender remains
        balanceGenders: function () {
            var males = this.maleCount;
            if (buggers.bugs.length > 1 && (males == 0 || males == buggers.bugs.length)) {
                // alternate 1 en 0
                buggers.bugs[0].flipGender();
            }
        },

        // Check if a liveCell is 'in' a bug, if so, feed the bug
        eaten: function (x, y) {
            var thisBug;
            for (var count in buggers.bugs) {
                thisBug = buggers.bugs[count];
                if (thisBug.overlaps(x, y)) {
                    thisBug.feed(thisBug.rightOrLeft(x, y));
                    return true;
                }
            }
            return false;
        },

        moveBugs: function () {
            for (var i = 0; i < buggers.bugs.length; i++) {
                var thisBug = buggers.bugs[i];
                thisBug.move();
                if (!thisBug.alive) {
                    this.deadBugs.push(i);
                }
            }
            // Remove dead bugs
            for (var j = this.deadBugs.length - 1; j >= 0; j--) {
                buggers.bugs.splice(this.deadBugs[j], 1);
            }
            this.deadBugs = [];

            this.balanceGenders();
        },

        addBugs: function (amount) {
            for (var count = 0; count < amount; count++) {
                var bug = new this.randomBug();
                bug.init();
                buggers.bugs.push(bug);
            }
        },

        giveBirth: function (bug) {

            // bug.action = 'giving birth';

            var partnerBug = buggers.bugs.filter(function (bug) {
                return bug.id === bug.partnerId;
            })[0];
            var strongestBug;
            var weakestBug;
            var oldestBug;

            if (partnerBug) {
                partnerBug.offspring++;
                partnerBug.fat -= buggers.minBugFat;
                strongestBug = (bug.fat > partnerBug.fat) ? bug : partnerBug;
                weakestBug = (bug.fat < partnerBug.fat) ? bug : partnerBug;
                oldestBug = (bug.generation > partnerBug.generation) ? bug : partnerBug;
            } else {
                strongestBug = bug;
                weakestBug = bug;
                oldestBug = bug;
            }

            bug.offspring++;
            bug.fat -= buggers.minBugFat;
            bug.partnerId = null;
            bug.pregnant = false;
            bug.recoverySteps = 0;

            var newBornBug = new buggers.randomBug();
            newBornBug.init();

            newBornBug.parentId = (bug.gender == 0) ? bug.id : partnerBug.id;
            newBornBug.generation = oldestBug.generation + 1;

            newBornBug.y = helpers.fixedDecimals(bug.y + Math.sin(bug.direction + helpers.randomSign() * pi / 2) * (Math.random() * 50 + bug.radius));
            newBornBug.x = helpers.fixedDecimals(bug.x + Math.cos(bug.direction + helpers.randomSign() * pi / 2) * (Math.random() * 50 + bug.radius));

            newBornBug.turnSteps = Math.abs(Math.round(strongestBug.turnSteps + helpers.randomSign() * weakestBug.turnSteps / 10));

            newBornBug.turnAmount = (strongestBug.turnAmount + helpers.randomSign() * Math.random() * weakestBug.turnAmount / 10) % (pi * 2);

            newBornBug.poopSteps = Math.round(strongestBug.poopSteps + helpers.randomSign() * weakestBug.poopSteps / 10);

            buggers.bugs.push(newBornBug);
        },

        // If parent exists return it
        parent: function (momId) {
            var motherBug = $.grep(buggers.bugs, function (bug) { return bug.id == momId; });
            if (motherBug.length) {
                return motherBug[0];
            } else {
                return null;
            }
        },

        lastAdultBug: function () {
            var lastBug = buggers.bugs[0];
            if (buggers.bugs.length == 1 && lastBug.adult()) {
                lastBug.gender = 0;
                return true;
            } else {
                return false;
            }
        },

        // random bug object
        randomBug: function () {
            // return {
            var self = this;
            self.action = '';
            self.actionStack = {
                _01whelp: {
                    doIt: false,
                    breakAfter: false,
                    do: 'giveBirth'  // buggers
                },
                _02digest: {
                    doIt: true,
                    breakAfter: false,
                    do: 'burnFat'  // this
                },
                _03defecate: {
                    doIt: false,
                    breakAfter: false,
                    do: 'addGlider'  // conway
                },
                _04die: {
                    doIt: false,
                    breakAfter: true,
                    do: 'scatter'   // conway
                },
                _05doStep: {
                    doIt: true,
                    breakAfter: false,
                    do: 'advance'  // this
                },
                _06divert: {
                    doIt: false,
                    breakAfter: true,
                    do: 'turnAway'  // buggers
                },
                _07findPartner: {
                    doIt: false,
                    breakAfter: true,
                    do: 'headForPartner' // buggers
                },
                _08follow: {
                    doIt: false,
                    breakAfter: true,
                    do: 'feedOnParent'  // this
                },
                _09food: {
                    doIt: false,
                    breakAfter: true,
                    do: 'reactToFood'  // this
                },
                _10flock: {
                    doIt: false,
                    breakAfter: false,
                    do: 'converge'  // buggers
                },
            };
            self.alive = true;
            self.fat = 0;
            self.foodLeft = 0;
            self.foodRight = 0;
            self.generation = 0;
            self.goal = 'none';
            self.goldenRatio = 1.618;
            self.maxRadius = 15;
            self.minRadius = 0;
            self.direction = 0;
            self.flockSteps = 0;
            self.poopSteps = 0;
            self.turnSteps = 0;
            self.gender = helpers.random01();
            self.id = buggers.bugId++;
            self.remnantCells = buggers.minBugFat;
            self.radius = 0;
            self.parentId = null;
            self.pregnant = false;
            self.maxSteps = 0;
            self.recoverySteps = 0;
            self.steps = 0;
            self.offspring = 0;
            self.turnDirection = helpers.randomSign;
            self.turnAmount = 0;
            self.x = 0;
            self.y = 0;
            self.navigate = function () {
                var fn;
                self.action = [];
                for (const action in self.actionStack) {
                    if (self.actionStack.hasOwnProperty(action) && self.actionStack[action].doIt) {
                        fn = self.actionStack[action].do;
                        self.action.push(fn);
                        if (typeof self[fn] == 'function') {
                            self[fn].apply();
                        } else if (typeof buggers[fn] == 'function') {
                            buggers[fn].call(self, self);
                        } else if (typeof conway[fn] == 'function') {
                            conway[fn].call(self, self);
                        }
                        if (self.actionStack[action].breakAfter) {
                            break;
                        }
                    }
                }
            };
            self.adult = function () {
                return self.radius > self.adultRadius();
            };
            self.adultRadius = function () {
                return self.maxRadius / self.goldenRatio;
            };
            self.advance = function () {
                self.x = helpers.fixedDecimals(helpers.xWrap(self.x + Math.cos(self.direction)));
                self.y = helpers.fixedDecimals(helpers.yWrap(self.y + Math.sin(self.direction)));
            };
            self.burnFat = function () {
                self.fat -= Math.ceil(Math.log10(self.fat) / 3);
                self.radius = self.getRadius();
            };
            self.calcAngle = function (pos) {
                var dX = pos[0] - self.x;
                var dY = pos[1] - self.y;
                var angle = Math.atan2(dY, dX);
                return angle;
            };
            self.calcDistance = function (thatBug) {
                var dX = self.x - thatBug.x;
                var dY = self.y - thatBug.y;
                var distance = Math.sqrt(Math.pow((dX), 2) + Math.pow((dY), 2));
                return distance;
            };
            self.converge = function () {
                if (buggers.bugs.length > 1) {
                    // self.action = 'converge';
                    var convergingPointDistance = 50; // Make variable input
                    var xTotal = 0;
                    var yTotal = 0;
                    var sinTotal = 0;
                    var cosTotal = 0;
                    var meanPos = [];
                    var targetPoint = [];
                    var direction = 0;
                    var bugCount = buggers.bugs.length;
                    var doConverge = false;
                    for (var i = 0; i < bugCount; i++) {
                        var thisBug = buggers.bugs[i];
                        if (self.differentBug(thisBug) && self.inConvergingRange(thisBug)) {
                            doConverge = true;
                            // get vector of thisBug
                            xTotal += thisBug.x;
                            yTotal += thisBug.y;
                            cosTotal += Math.cos(thisBug.direction);
                            sinTotal += Math.sin(thisBug.direction);
                        }
                    }
                    if (doConverge) {
                        meanPos[0] = xTotal / (bugCount - 1);
                        meanPos[1] = yTotal / (bugCount - 1);
                        var meanDirection = Math.atan2(sinTotal, cosTotal);

                        targetPoint[0] = meanPos[0] + cosTotal * convergingPointDistance;
                        targetPoint[1] = meanPos[1] + sinTotal * convergingPointDistance;
                        var directionToTargetPos = self.calcAngle(targetPoint);

                        self.nudge(directionToTargetPos);
                    }

                }
            };
            self.differentBug = function (thatBug) {
                return self.id !== thatBug.id;
            };
            self.findPartner = function () {
                var closestCandidatePartner = null;
                var bugCount = buggers.bugs.length;
                var closestDistance = Infinity;
                for (var i = 0; i < bugCount; i++) {
                    var thisBug = buggers.bugs[i];
                    if (self.fertile(thisBug)) {
                        var distance = self.calcDistance(thisBug);
                        if (distance < closestDistance) {
                            closestCandidatePartner = thisBug;
                        }
                    }
                }
                return closestCandidatePartner;
            };
            self.feed = function (right) {
                if (right) {
                    self.foodRight++;
                } else {
                    self.foodLeft++;
                }
                self.fat += buggers.cellNutritionValue;
            };
            self.feedOnParent = function () {
                // self.action = 'parent';
                var parentBug = buggers.parent(self.parentId);
                if (parentBug) {
                    parentBug.fat--;
                    self.fat++;
                    self.direction = parentBug.direction;
                }
            };
            self.fertile = function (thatBug) {
                return self.oppositeGender(thatBug) && thatBug.adult() && !self.pregnant;
            };
            self.fertilize = function (thatBug) {
                // self.action = 'mating';
                if (self.gender == 0) {
                    self.pregnant = true;
                    self.partnerId = thatBug.id;
                }
                if (thatBug.gender == 0) {
                    thatBug.pregnant = true;
                    thatBug.partnerId = self.id;
                }
            };
            self.flipGender = function () {
                self.gender = helpers.flipBit(self.gender);
            };
            self.getRadius = function () {
                // just pithagoras
                var newRadius = Math.sqrt(
                    Math.pow(self.maxSteps / 2, 2) -
                    Math.pow(self.steps - self.maxSteps / 2, 2)
                ) * 2 * self.maxRadius / self.maxSteps;
                return newRadius;
            };
            self.headForPartner = function () {
                var candidate = self.findPartner();
                if (candidate) {
                    if (self.together(candidate)) {
                        self.fertilize(candidate);
                    } else {
                        // self.action = 'head for ' + candidate.id;
                        var candidatePos = [candidate.x, candidate.y];
                        var candidateDirection = self.calcAngle(candidatePos);
                        self.nudge(candidateDirection);
                    }
                }
            };
            self.inConvergingRange = function (thatBug) {
                var distance = self.calcDistance(thatBug);
                var inRange = distance < buggers.flockingDistance;
                return inRange;
            };
            self.inFront = function (thatBug) {
                var perpendicularAxis = thatBug.x * Math.sin(self.direction - pi / 2);
                if (self.movingDown()) {
                    return thatBug.y > perpendicularAxis;
                } else {
                    return thatBug.y < perpendicularAxis;
                }
            };
            self.isPriority = function (newSteps) {
                return self.steps % newSteps == 0;
            };
            self.move = function () {
                self.alive = (self.fat > buggers.minBugFat) || (self.radius >= self.minRadius && self.steps > 100);
                self.steps++;
                self.recoverySteps += (self.pregnant) ? 1 : 0;
                self.actionStack._01whelp.doIt = (self.recoverySteps == buggers.pregnancySteps) && ((self.gender == 0) || buggers.lastAdultBug());
                self.actionStack._02digest.doIt = (self.fat > buggers.minBugFat);
                self.actionStack._03defecate.doIt = self.isPriority(self.poopSteps);
                self.actionStack._04die.doIt = !self.alive;
                self.actionStack._06divert.doIt = self.watchForCloseBugsAhead(self);
                self.actionStack._07findPartner.doIt = self.adult() && (buggers.bugs.length < buggers.maxBugsCount);
                self.actionStack._08follow.doIt = (self.steps < self.newBornSteps);
                self.actionStack._09food.doIt = self.isPriority(self.turnSteps);
                self.actionStack._10flock.doIt = self.isPriority(self.flockSteps) && buggers.flocking;
                self.navigate();
            };
            self.movingDown = function () {
                return Math.sin(self.direction) > 0;
            };
            self.movingToRight = function () {
                return Math.cos(self.direction) > 0;
            };
            // change self direction towards given direction a bit
            self.nudge = function (direction) {
                var tempDirection = helpers.positiveAngle(direction - self.direction);
                var nudgeAngle = pi / 32;
                if (tempDirection > pi) {
                    self.direction -= nudgeAngle;
                } else {
                    self.direction += nudgeAngle;
                }
                self.direction = helpers.positiveAngle(self.direction);
            };
            self.oppositeGender = function (thatBug) {
                return self.gender !== thatBug.gender;
            };
            self.reactToFood = function () {
                if (self.foodLeft !== self.foodRight) {
                    var right = self.foodRight > self.foodLeft;
                    // self.action = (right) ? 'food right' : 'food left';
                    self.turn(right);
                    self.foodRight = 0;
                    self.foodLeft = 0;
                }
            };
            self.rightOrLeft = function (x, y) {
                var bugAxis = Math.tan(self.direction) * x + self.y;
                if (self.movingToRight()) {
                    return y > bugAxis; // food was on the right side of self if true
                } else {
                    return y < bugAxis; // food was on the right side of self if true
                }
            };
            self.together = function (thatBug) {
                var minDistance = self.radius + thatBug.radius;
                var distance = self.calcDistance(thatBug);
                return distance < minDistance;
            };
            self.turn = function (right) {
                var sign = (right) ? 1 : -1;
                self.direction += (sign * self.turnAmount);
                self.direction = helpers.positiveAngle(self.direction);
            };
            self.turnAway = function () {
                // self.action = 'turnAway';
                var tooCloseBugs = self.actionStack._06divert.doIt;
                var bugCount = tooCloseBugs.length;
                if (bugCount > 0) {
                    var xTotal = 0;
                    var yTotal = 0;
                    var meanPos = [];
                    for (var i = 0; i < bugCount; i++) {
                        var thisBug = tooCloseBugs[i];
                        xTotal += thisBug.x;
                        yTotal += thisBug.y;
                    }
                    meanPos[0] = xTotal / bugCount;
                    meanPos[1] = yTotal / bugCount;
                    var directionToMeanPos = self.calcAngle(meanPos);
                    self.nudge(directionToMeanPos - pi);
                }
            };
            self.watchForCloseBugsAhead = function () {
                var bugCount = buggers.bugs.length;
                var closeBugsAhead = [];
                for (var i = 0; i < bugCount; i++) {
                    var thisBug = buggers.bugs[i];
                    if (self.differentBug(thisBug) && self.inFront(thisBug)) {
                        var minDistance = self.radius + thisBug.radius + buggers.repellingDistance;
                        var distance = self.calcDistance(thisBug);
                        if (distance < minDistance) {
                            closeBugsAhead.push(thisBug);
                        }
                    }
                }
                return (closeBugsAhead.length > 0) ? closeBugsAhead : false;
            };
            self.overlaps = function (x, y) {
                return ((Math.pow(x - self.x, 2) + Math.pow(y - self.y, 2)) < Math.pow(self.radius, 2));
            };
            self.init = function () {
                self.direction = Math.random() * 2 * pi;
                self.fat = 4 * buggers.minBugFat;
                self.flockSteps = 10 + Math.ceil(Math.random() * 25);
                self.gender = helpers.random01();
                self.maxSteps = buggers.maxBugSteps + helpers.randomSign() * Math.random() * 1000;
                self.minRadius = Math.ceil(Math.random() * 7);
                self.radius = self.minRadius;
                self.poopSteps = Math.ceil(Math.random() * 40 + 10);
                self.turnAmount = Math.random() * pi / 4;
                self.turnSteps = Math.ceil(Math.random() * 100);
                self.x = helpers.fixedDecimals((Math.random() * conway.spaceWidth) * interface.cellSize, 2);
                self.y = helpers.fixedDecimals((Math.random() * conway.spaceHeight) * interface.cellSize, 2);
            };
        }
        // },
    };

    var helpers = {

        fixedDecimals: function (num, dec) {
            if (!dec) {
                dec = 2;
            }
            // decimals -> power
            var decimalFactor = Math.pow(10, dec);
            // return dec -> fraction digits
            return Math.round(num * decimalFactor) / decimalFactor;
        },

        positiveAngle: function (angle) {
            return (angle + 4 * pi) % (2 * pi);
        },

        xWrap: function (x) {
            return (x + interface.canvas.width) % interface.canvas.width;
        },

        yWrap: function (y) {
            return (y + interface.canvas.height) % interface.canvas.height;
        },

        randomSign: function () {
            return (Math.random() > Math.random()) ? 1 : -1;
        },

        random01: function () {
            return Math.floor(Math.random() * 2);
        },

        // alternate 0 and 1
        flipBit: function (bit) {
            return Math.abs(bit - 1);
        },

    };

    var gogogo = null,
        interval = 0, // Milliseconds between iterations
        pi = Math.PI,
        prevSteps = 0,
        running = false,
        speedHandle = null;

    // Set some variables
    function initVariables() {
        controls.initControls();
        interface.initInterface();
        conway.initLife();
        buggers.initBugs();
    }

    function updateScreen() {
        interface.fadeCells();
        interface.drawCells();
        buggers.drawBugs();
        if (conway.lifeSteps % interface.dataCycle == 0) {
            interface.updateCellularData();
            if (interface.showData) {
                interface.showDataTable(buggers.bugs);
            }
        }
        if (interface.showGraph) {
            interface.drawGraph();
        }
        if (conway.lifeSteps % (interface.canvas.width * interface.xScale) == 0) {
            interface.fadeGraph();
        }
    }

    // Animation function
    function bugLifeStep() {
        conway.lifeSteps += 1;
        conway.addNewLifeCells();
        conway.zeroNeighbours();
        conway.countNeighbours();
        conway.evalNeighbours();
        buggers.moveBugs();
        updateScreen();
    }

    function firstStep() {
        if (interface.canvas.getContext) {
            initVariables();
            updateScreen();
        } else {
            // canvas-unsupported code here
            $('.noCanvas').show();
        }
    }

    function setIntervals() {
        gogogo = setInterval(bugLifeStep, interval);
        speedHandle = setInterval(conway.calcSpeed, 1000);
    }

    function clearIntervals() {
        clearInterval(gogogo);
        clearInterval(speedHandle);
    }

    // Start life animation
    function startBugLife() {
        $('.trails').attr('checked', true);
        if (running === false) {
            setIntervals();
        }
        running = true;
    }

    // Show start button again after user clicked stopbutton
    function stopBugLife() {
        clearIntervals();
        running = false;
    }

    // stop and startlife (with new interval)
    function stopStartBugLife() {
        stopBugLife();
        startBugLife();
    }

    // Restart everything when user clicks restart button
    function restartBugLife() {
        if (running === true) {
            clearIntervals();
        }
        running = false;
        lifeSteps = 0;
        prevSteps = 0;
        firstStep();
        $('.trails').attr('checked', true);
        if (running === false) {
            setIntervals();
        }
        running = true;
    }

    // Clear the canvas (in order to draw manually on it)
    function clearBugLife() {
        if (running === true) {
            clearIntervals();
        }
        running = false;
        lifeSteps = 0;
        initVariables();
        interface.updateCellularData();
    }

    firstStep();
    if (running === false) {
        startBugLife();
    }

});

// TODO
// inherit flocking steps
// divert better
// inherit (flocking) distance
// young bugs die too soon
// cleaner bug navigation