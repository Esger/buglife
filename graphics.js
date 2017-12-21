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
            this.bugsYscale = (buggers.maleCount() != 0) ? Math.floor(this.graphCanvas.height / buggers.maleCount()) : this.graphCanvas.height / 5;
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
                ctx.fillRect(scaledSteps % graphCanvas.width, graphCanvas.height - maleCount() * 5, 1, 1);
                ctx.fillStyle = (scaledSteps % 2 == 0) ? "rgba(0,0,0)" : "rgba(0,0,128,0.3)";
                ctx.fillRect(scaledSteps % graphCanvas.width, graphCanvas.height - femaleCount() * 5, 1, 1);
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

            $bugCount.text(bugs.length);
            for (var i = 0; i < bugs.length; i++) {
                var thisBug = bugs[i];
                var $oldTr = $bugData.find('tr#bug' + thisBug.id);
                if (thisBug.alive) {
                    var $tr = $('<tr style="color:' + color(thisBug) + ';" id="bug' + thisBug.id + '"></tr>');
                    $tr.append('<td>' + (thisBug.id + '').substr(-4) + '</td>');
                    // $tr.append('<td>' + thisBug.gender + '</td>');
                    $tr.append('<td>' + Math.round(thisBug.fat) + '</td>');
                    // $tr.append('<td>' + thisBug.radius + '</td>');
                    // $tr.append('<td>' + thisBug.direction + '</td>');
                    // $tr.append('<td>' + thisBug.x + '</td>');
                    // $tr.append('<td>' + thisBug.y + '</td>');
                    $tr.append('<td>' + helpers.fixedDecimals(thisBug.direction / pi, 2) + '</td>');
                    // $tr.append('<td>' + helpers.fixedDecimals(thisBug.bounceSteps) + '</td>');
                    // $tr.append('<td>' + helpers.fixedDecimals(thisBug.recoverySteps) + '</td>');
                    $tr.append('<td>' + helpers.fixedDecimals(thisBug.turnAmount) + '</td>');
                    $tr.append('<td>' + helpers.fixedDecimals(thisBug.turnSteps) + '</td>');
                    $tr.append('<td>' + helpers.fixedDecimals(thisBug.poopSteps) + '</td>');
                    $tr.append('<td>' + thisBug.offspring + '</td>');
                    $tr.append('<td>' + thisBug.generation + '</td>');
                    $tr.append('<td>' + thisBug.action + '</td>');
                    if ($oldTr.length) {
                        $oldTr.replaceWith($tr);
                    } else {
                        $bugData.append($tr);
                    }
                } else {
                    $oldTr.remove();
                }
            }
            $.each($bugData.find('tr[id^="bug"]'), function () {
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
                flocking = $('.flock').is(":checked");
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

            $('#bugrules input').on('click', function () {
                buggers.initBugrules();
            });

            this.$startBugCount.val(buggers.startBugsCount);
            this.$startBugCount.on('change', function () {
                buggers.startBugsCount = parseInt(this.$startBugCount.val());
            });
            this.$flockingDistance.val(buggers.flockingDistance);
            this.$flockingDistance.on('change', function () {
                buggers.flockingDistance = parseInt(this.$flockingDistance.val());
            });
            this.$repellingDistance.val(buggers.repellingDistance);
            this.$repellingDistance.on('change', function () {
                buggers.repellingDistance = parseInt(this.$repellingDistance.val());
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
                conway.liveCells.push(celXY(mouseX, mouseY));
                conway.drawCells();
                interface.updateCellularData();
            });

            // init cellNutritionValue;
            interface.$cellNutritionValue.val(buggers.cellNutritionValue);
            // Life cell nutrition value updaten
            interface.$cellNutritionValue.on('change', function () {
                buggers.cellNutritionValue = parseInt(interface.$cellNutritionValue.val());
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
                this.liveCells[count] = this.celXY(Math.floor(Math.random() * this.spaceWidth), Math.floor(Math.random() * this.spaceHeight));
            }
        },

        // Calculate generations per second
        calcSpeed: function () {
            this.speed = this.lifeSteps - this.prevSteps;
            this.prevSteps = this.lifeSteps;
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
                    self.liveCells.push(self.celXY(x, y));
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
            for (var i = bug.fat * graveMultiplier; i > 0; i--) {
                r = Math.random() * graveRadius + bug.maxRadius;
                angle = Math.random() * 2 * pi;
                x = helpers.xWrap(bug.radius + Math.round(bug.x + Math.cos(angle) * r));
                y = helpers.yWrap(bug.radius + Math.round(bug.y + Math.sin(angle) * r));
                newLifeCells.push(celXY(x, y));
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
            cells = $.extend(true, {}, walkers[pooDirection]); // deep copy
            for (var key in cells) {
                if (cells.hasOwnProperty(key)) {
                    var cell = cells[key];
                    cell[0] = helpers.xWrap(cell[0] + poo.x);
                    cell[1] = helpers.yWrap(cell[1] + poo.y);
                    newLifeCells.push(celXY(cell[0], cell[1]));
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
        maxBugSteps: 10000,
        minBugFat: 100,
        neighbours: [], // Array with neighbours count
        newBornSteps: 500,
        pregnancySteps: 100,
        startBugsCount: 17,

        maleCount: function () {
            return this.bugs.filter(function (bug, i, bugs) {
                return bug.gender == 1;
            }).length;
        },

        femaleCount: function () {
            return bugs.length - maleCount();
        },

        initBugs: function () {
            this.bugId = 1;
            this.bugs = [];
            this.deadBugs = [];
            this.initBugrules();
            this.addBugs(this.startBugsCount);
        },

        // Bind inputs for bug rules
        initBugrules: function () {
        },

        // Draw the bugs
        drawBugs: function () {
            var thisBug;
            for (var i = 0; i < this.bugs.length; i++) {
                thisBug = this.bugs[i];
                interface.drawBug(thisBug);
            }
        },

        // alternate 0 and 1
        flipBit: function (bit) {
            return Math.abs(bit - 1);
        },

        // Change gender of a bug if only one gender remains
        balanceGenders: function () {
            var males = maleCount();
            if (bugs.length > 1 && (males == 0 || males == bugs.length)) {
                // alternate 1 en 0
                bugs[0].flipGender();
            }
        },

        // Check if a liveCell is 'in' a bug, if so, feed the bug
        eaten: function (x, y) {
            var thisBug;
            function inCircle(x, y, bug) {
                return ((Math.pow(x - bug.x, 2) + Math.pow(y - bug.y, 2)) < Math.pow(bug.radius, 2));
            }
            function whichSide(x, y, bug) {
                // todo this is not correct
                var movingToRight = Math.cos(bug.direction) > 0;
                var bugAxis = Math.tan(bug.direction) * x + bug.y;
                if (movingToRight) {
                    return y > bugAxis; // food was on the right side of bug if true
                } else {
                    return y < bugAxis; // food was on the right side of bug if true
                }
            }
            for (var count in this.bugs) {
                thisBug = this.bugs[count];
                if (inCircle(x, y, thisBug)) {
                    thisBug.feed(whichSide(x, y, thisBug));
                    return true;
                }
            }
            return false;
        },

        moveBugs: function () {
            for (var i = 0; i < this.bugs.length; i++) {
                var thisBug = this.bugs[i];
                thisBug.move();
                if (!thisBug.alive) {
                    this.deadBugs.push(i);
                }
            }
            // Remove dead bugs
            for (var j = this.deadBugs.length - 1; j >= 0; j--) {
                this.bugs.splice(this.deadBugs[j], 1);
            }
            this.deadBugs = [];

            this.balanceGenders();
        },

        addBugs: function (amount) {
            for (var count = 0; count < amount; count++) {
                var bug = new this.randomBug();
                bug.init();
                this.bugs.push(bug);
            }
        },

        giveBirth: function (bug) {

            bug.action = 'giving birth';

            var partnerBug = bugs.filter(function (bug) {
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

            var newBornBug = new randomBug();
            newBornBug.parentId = (bug.gender == 0) ? bug.id : partnerBug.id;
            newBornBug.generation = oldestBug.generation + 1;

            newBornBug.y = helpers.fixedDecimals(bug.y + Math.sin(bug.direction + helpers.randomSign() * pi / 2) * (Math.random() * 50 + bug.radius));
            newBornBug.x = helpers.fixedDecimals(bug.x + Math.cos(bug.direction + helpers.randomSign() * pi / 2) * (Math.random() * 50 + bug.radius));

            newBornBug.turnSteps = Math.abs(Math.round(strongestBug.turnSteps + helpers.randomSign() * weakestBug.turnSteps / 10));

            newBornBug.turnAmount = (strongestBug.turnAmount + helpers.randomSign() * Math.random() * weakestBug.turnAmount / 10) % (pi * 2);

            newBornBug.poopSteps = Math.round(strongestBug.poopSteps + helpers.randomSign() * weakestBug.poopSteps / 10);

            bugs.push(newBornBug);
        },

        // If parent exists return part of its fat
        parent: function (momId) {
            var motherBug = $.grep(bugs, function (bug) { return bug.id == momId; });
            if (motherBug.length) {
                return motherBug[0];
            } else {
                return null;
            }
        },

        calcDistance: function (thisBug, thatBug) {
            var dX = thisBug.x - thatBug.x;
            var dY = thisBug.y - thatBug.y;
            var distance = Math.sqrt(Math.pow((dX), 2) + Math.pow((dY), 2));
            return distance;
        },

        inFront: function (thisBug, thatBug) {
            var perpendicularDirection = thisBug.direction - pi / 2;
            return thatBug.y > thatBug.x * Math.sin(perpendicularDirection);
        },

        calcAngle: function (bug, pos) {
            var dX = pos[0] - bug.x;
            var dY = pos[1] - bug.y;
            var angle = Math.atan2(dY, dX);
            return angle;
        },

        // change bug direction towards given direction a bit
        nudge: function (bug, direction) {
            var tempDirection = helpers.positiveAngle(direction - bug.direction);
            var nudgeAngle = pi / 32;
            if (tempDirection > pi) {
                bug.direction -= nudgeAngle;
            } else {
                bug.direction += nudgeAngle;
            }
            bug.direction = helpers.positiveAngle(bug.direction);
        },

        spread: function (bug) {
            bug.action = 'diverge';
            var tooCloseBugs = bug.actionStack.divert.doIt;
            var xTotal = 0;
            var yTotal = 0;
            var meanPos = [];
            var bugCount = closeBugs.length;
            var bugsInfront = false;
            for (var i = 0; i < bugCount; i++) {
                var thisBug = closeBugs[i];
                if (inFront(bug, thisBug)) {
                    bugsInfront = true;
                    xTotal += thisBug.x;
                    yTotal += thisBug.y;
                }
            }
            if (bugsInfront) {
                meanPos[0] = xTotal / bugCount;
                meanPos[1] = yTotal / bugCount;
                var directionToMeanPos = calcAngle(bug, meanPos);
                nudge(bug, directionToMeanPos - pi);
            }
        },

        inConvergingRange: function (thisBug, thatBug) {
            var distance = calcDistance(thisBug, thatBug);
            var inRange = distance < flockingDistance;
            return inRange;
        },

        notSameBug: function (thisBug, thatBug) {
            return thisBug.id !== thatBug.id;
        },

        converge: function (bug) {
            if (bugs.length > 1) {
                bug.action = 'converge';
                var convergingPointDistance = 50; // Make variable input
                var xTotal = 0;
                var yTotal = 0;
                var sinTotal = 0;
                var cosTotal = 0;
                var meanPos = [];
                var targetPoint = [];
                var direction = 0;
                var bugCount = bugs.length;
                var doConverge = false;
                for (var i = 0; i < bugCount; i++) {
                    var thisBug = bugs[i];
                    if (notSameBug(thisBug, bug) && inConvergingRange(bug, thisBug)) {
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
                    var directionToTargetPos = calcAngle(bug, targetPoint);

                    nudge(bug, directionToTargetPos);
                }

            }
        },

        watchForCloseBugs: function (bug) {
            var bugCount = this.bugs.length;
            var closeBugs = [];
            for (var i = 0; i < bugCount; i++) {
                var thisBug = this.bugs[i];
                if (this.notSameBug(thisBug, bug)) {
                    var minDistance = bug.radius + thisBug.radius + this.repellingDistance;
                    var distance = this.calcDistance(bug, thisBug);
                    if (distance < minDistance) {
                        closeBugs.push(thisBug);
                    }
                }
            }
            return (closeBugs.length > 0) ? closeBugs : false;
        },

        differentGenders: function (thisBug, thatBug) {
            return thisBug.gender !== thatBug.gender;
        },

        bothAdult: function (thisBug, thatBug) {
            return thisBug.adult() && thatBug.adult() && !thisBug.pregnant && !thatBug.pregnant;
        },

        fertile: function (thisBug, thatBug) {
            return differentGenders(thisBug, thatBug) && bothAdult(thisBug, thatBug) && !thisBug.pregnant && bugs.length < 23;
        },

        together: function (thisBug, thatBug) {
            var minDistance = thisBug.radius + thatBug.radius;
            var distance = calcDistance(thisBug, thatBug);
            return distance < minDistance;
        },

        lastAdultBug: function () {
            var lastBug = this.bugs[0];
            if (this.bugs.length == 1 && lastBug.adult()) {
                lastBug.gender = 0;
                return true;
            } else {
                return false;
            }
        },

        fertilize: function (thisBug, thatBug) {
            thisBug.action = 'mating';

            if (thisBug.gender == 0) {
                thisBug.pregnant = true;
                thisBug.partnerId = thatBug.id;
            }
            if (thatBug.gender == 0) {
                thatBug.pregnant = true;
                thatBug.partnerId = thisBug.id;
            }
        },

        canMate: function (bug) {
            var closestCandidatePartner = null;
            var bugCount = bugs.length;
            var closestDistance = Infinity;
            for (var i = 0; i < bugCount; i++) {
                var thisBug = bugs[i];
                if (fertile(bug, thisBug)) {
                    var distance = calcDistance(bug, thisBug);
                    if (distance < closestDistance) {
                        closestCandidatePartner = thisBug;
                    }
                }
            }
            return closestCandidatePartner;
        },

        headForPartner: function (bug) {
            var candidate = canMate(bug);
            if (candidate) {
                if (together(bug, candidate)) {
                    fertilize(bug, candidate);
                } else {
                    bug.action = 'head for ' + thatBug.id;
                    var candidatePos = [candidate.x, candidate.y];
                    var candidateDirection = calcAngle(bug, candidatePos);
                    nudge(bug, candidateDirection);
                }
            }
        },

        // random bug object
        randomBug: function () {
            return {
                actionStack: {
                    whelp: {
                        doIt: false,
                        do: 'giveBirth'  // buggers
                    },
                    die: {
                        doIt: false,
                        do: 'scatter'   // conway
                    },
                    follow: {
                        doIt: false,
                        do: 'feedOnParent'  // this
                    },
                    divert: {
                        doIt: false,
                        do: 'spread'  // buggers
                    },
                    findPartner: {
                        doIt: false,
                        do: 'headForPartner' // buggers
                    },
                    digest: {
                        doIt: true,
                        do: 'burnFat'  // this
                    },
                    food: {
                        doIt: false,
                        do: 'reactToFood'  // this
                    },
                    flock: {
                        doIt: false,
                        do: 'converge'  // buggers
                    },
                    defecate: {
                        doIt: false,
                        do: 'addGlider'  // conway
                    },
                    doStep: {
                        doIt: true,
                        do: 'advance'  // this
                    }
                },
                alive: true,
                fat: 0,
                foodLeft: 0,
                foodRight: 0,
                generation: 0,
                goal: 'none',
                goldenRatio: 1.618,
                maxRadius: 15,
                minRadius: 0,
                direction: 0,
                flockSteps: 0,
                poopSteps: 0,
                turnSteps: 0,
                gender: helpers.random01(),
                id: this.bugId++,
                remnantCells: buggers.minBugFat,
                radius: 0,
                parentId: null,
                pregnant: false,
                maxSteps: 0,
                recoverySteps: 0,
                steps: 0,
                offspring: 0,
                turnDirection: helpers.randomSign,
                turnAmount: 0,
                x: 0,
                y: 0,
                navigate: function () {
                    var fn;
                    for (const action in this.actionStack) {
                        if (this.actionStack.hasOwnProperty(action) && this.actionStack[action].doIt) {
                            fn = this.actionStack[action].do;
                            if (typeof this[fn] == 'function') {
                                this[fn].apply();
                            } else if (typeof buggers[fn] == 'function') {
                                buggers[fn].call(this);
                            } else if (typeof conway[fn] == 'function') {
                                conway[fn].call(this);
                            }
                            break;
                        }
                    }
                },
                adultRadius: function () {
                    return this.maxRadius / this.goldenRatio;
                },
                adult: function () {
                    return this.radius > this.adultRadius();
                },
                flipGender: function () {
                    this.gender = flipBit(this.gender);
                },
                getRadius: function () {
                    // just pithagoras
                    var newRadius = Math.sqrt(
                        Math.pow(this.maxSteps / 2, 2) -
                        Math.pow(this.steps - this.maxSteps / 2, 2)
                    ) * 2 * this.maxRadius / this.maxSteps;
                    return newRadius;
                },
                isPriority(newSteps) {
                    return this.steps % newSteps == 0;
                },
                reactToFood: function () {
                    if (this.foodLeft !== this.foodRight) {
                        var right = this.foodRight > this.foodLeft;
                        this.action = (right) ? 'food right' : 'food left';
                        this.turn(right);
                        this.foodRight = 0;
                        this.foodLeft = 0;
                    }
                },
                turn: function (right) {
                    var sign = (right) ? 1 : -1;
                    this.direction += (sign * this.turnAmount);
                    this.direction = helpers.positiveAngle(this.direction);
                },
                advance: function () {
                    this.x = helpers.fixedDecimals(helpers.xWrap(this.x + Math.cos(this.direction)));
                    this.y = helpers.fixedDecimals(helpers.yWrap(this.y + Math.sin(this.direction)));
                },
                burnFat: function () {
                    this.fat -= Math.ceil(Math.log10(this.fat) / 3);
                    this.radius = this.getRadius();
                },
                feedOnParent: function () {
                    this.action = 'parent';
                    var parentBug = parent(this.parentId);
                    if (parentBug) {
                        parentBug.fat--;
                        this.fat++;
                        this.direction = parentBug.direction;
                    }
                },
                move: function () {
                    this.alive = (this.fat > buggers.minBugFat) && (this.radius >= this.minRadius);
                    this.steps++;
                    this.recoverySteps += (this.pregnant) ? 1 : 0;
                    this.actionStack.die.doIt = !this.alive;
                    this.actionStack.whelp.doIt = (this.isPriority(this.pregnancySteps) && (this.gender == 0)) || buggers.lastAdultBug();
                    this.actionStack.divert.doIt = buggers.watchForCloseBugs(this);
                    this.actionStack.findPartner.doIt = this.adult();
                    this.actionStack.follow.doIt = (this.steps < this.newBornSteps);
                    this.actionStack.food.doIt = this.isPriority(this.turnSteps);
                    this.actionStack.defecate.doIt = this.isPriority(this.poopSteps);
                    this.actionStack.digest.doIt = (this.fat > buggers.minBugFat);
                    this.actionStack.flock.doIt = this.isPriority(this.flockSteps);
                    this.navigate();
                },
                feed: function (right) {
                    if (right) {
                        this.foodRight++;
                    } else {
                        this.foodLeft++;
                    }
                    this.fat += cellNutritionValue;
                },
                init: function () {
                    this.direction = Math.random() * 2 * pi;
                    this.fat = 4 * buggers.minBugFat;
                    this.flockSteps = 10 + Math.ceil(Math.random() * 25);
                    this.gender = helpers.random01();
                    this.maxSteps = buggers.maxBugSteps + helpers.randomSign() * Math.random() * 1000;
                    this.minRadius = Math.ceil(Math.random() * 7);
                    this.radius = this.minRadius;
                    this.poopSteps = Math.ceil(Math.random() * 40 + 10);
                    this.turnAmount = Math.random() * pi / 4;
                    this.turnSteps = Math.ceil(Math.random() * 100);
                    this.x = helpers.fixedDecimals((Math.random() * conway.spaceWidth) * conway.cellSize, 2);
                    this.y = helpers.fixedDecimals((Math.random() * conway.spaceHeight) * conway.cellSize, 2);
                }
            };
        },
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
        // buggers.drawBugs();
        if (conway.lifeSteps % interface.dataCycle == 0) {
            interface.updateCellularData();
            if (interface.showData) {
                // interface.showDataTable(buggers.bugs);
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