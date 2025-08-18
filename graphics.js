$(function () {
    // "use strict";

    var display = {
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
            let ctx = this.canvas.getContext('2d');
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
            let ctx = this.canvas.getContext('2d');
            if ($('.trails').is(":checked")) {
                ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
            } else {
                ctx.fillStyle = "rgb(255, 255, 255)";
            }
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        },

        // Fade the old graph a bit to white
        fadeGraph: function () {
            let ctx = this.graphCanvas.getContext('2d');
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            ctx.fillRect(0, 0, this.graphCanvas.width, this.graphCanvas.height);
        },

        // Draw the array with livecells
        drawCells: function () {
            let ctx = this.canvas.getContext('2d');
            ctx.fillStyle = "rgb(128, 128, 0)";
            const count = conway.liveCells.length;
            let i = 0;
            for (; i < count; i += 1) {
                ctx.fillRect(conway.liveCells[i].x * this.cellSize, conway.liveCells[i].y * this.cellSize, this.cellSize, this.cellSize);
            }
            conway.cellsAlive = conway.liveCells.length;
        },

        drawBug: function (bug) {
            let ctx = display.canvas.getContext('2d');
            let adult = (bug.adult() && !bug.pregnant) ? 1 : 0;
            let image = this.bugImages[bug.gender][adult];
            let scale = Math.max(bug.radius, bug.minRadius) / 16;
            ctx.save();
            ctx.translate(bug.x, bug.y);
            ctx.rotate(bug.direction - PI / 2);
            ctx.scale(scale, scale);
            ctx.drawImage(image, - 16, - 16);
            if (this.showData) {
                let progressRadius = Math.max(bug.radius - 2.5, 1);
                let bugRear = 3 * PI / 2;
                let progress = (1 - bug.steps / bug.maxSteps) * PI / 2;
                let startAngle = bugRear - progress;
                let endAngle = bugRear + progress;
                ctx.strokeStyle = "rgba(0,255,0,.7)";
                ctx.lineWidth = '3';
                ctx.beginPath();
                ctx.arc(0, 0, progressRadius, startAngle, endAngle);
                ctx.stroke();
                ctx.fillStyle = "rgb(0,0,0)";
                ctx.fillText(bug.id, - 6, - 2);
            }
            ctx.restore();
        },

        // Draw the array with livecells
        drawGraph: function () {
            let scaledSteps = Math.round(conway.lifeSteps / display.xScale);
            if (conway.lifeSteps % display.xScale == 0) {
                let ctx = display.graphCanvas.getContext('2d');
                ctx.fillStyle = "rgb(128, 128, 0)";
                ctx.fillRect(scaledSteps % display.graphCanvas.width, display.graphCanvas.height - conway.cellsAlive * display.yScale, 1, 1);
                ctx.fillStyle = (scaledSteps % 2 == 0) ? "rgba(128,0,0,0.3)" : "rgba(0,0,0)";
                ctx.fillRect(scaledSteps % display.graphCanvas.width, display.graphCanvas.height - buggers.maleCount * 5, 1, 1);
                ctx.fillStyle = (scaledSteps % 2 == 0) ? "rgba(0,0,0)" : "rgba(0,0,128,0.3)";
                ctx.fillRect(scaledSteps % display.graphCanvas.width, display.graphCanvas.height - buggers.femaleCount * 5, 1, 1);
            }
        },

        // Uit object halen?
        showDataTable: function (bugs) {
            var $tr;
            var color = function (thisBug) {
                let rgbVal;
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
            };
            var addDataCol = function (property) {
                if ((typeof property == 'number') && (property * 100 % 1 > 0)) {
                    property = helpers.fixedDecimals(property);
                }
                return $('<td>' + property + '</td>');
            };
            var addDataRow = function (bug) {
                // Add bug properties to this array to show in data table
                let dataItems = ['id', 'fat', 'turnAmount', 'turnSteps', 'pregnant', 'offspring', 'generation'];
                let $row = $('<tr></tr>');
                let i = 0;
                const count = dataItems.length;
                for (; i < count; i += 1) {
                    const item = dataItems[i];
                    if (bug) {
                        $tr.append(addDataCol(bug[item]));
                    } else {
                        $row.append(addDataCol(item));
                    }
                }
                return $row || $tr;
            };

            controls.$bugCount.text(bugs.length);
            let $tHeadContent = $('#bugData thead tr');
            $tHeadContent.replaceWith(addDataRow());
            let i = 0;
            const count = bugs.length;
            for (; i < count; i += 1) {
                let thisBug = bugs[i];
                let $oldTr = display.$bugData.find('tr#bug' + thisBug.id);
                if (thisBug.alive) {
                    $tr = $('<tr style="color:' + color(thisBug) + ';" id="bug' + thisBug.id + '"></tr>');
                    $tr.append(addDataRow(thisBug));
                    // $tr.append('<td>' + (thisBug.id + '').substr(-4) + '</td>');
                    // $tr.append('<td>' + Math.round(thisBug.fat) + '</td>');
                    // $tr.append('<td class="smaller">' + thisBug.action.join(' ') + '</td>');
                    if ($oldTr.length) {
                        $oldTr.replaceWith($tr);
                    } else {
                        display.$bugData.append($tr);
                    }
                } else {
                    $oldTr.remove();
                }
            }
            $.each(display.$bugData.find('tr[id^="bug"]'), function () {
                let thisTr = this;
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
        $flockingPeers: $('.flockingPeers'),
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

            $('#graphtoggler').off().on('click', function () {
                display.showGraph = !display.showGraph;
                $('#lifeChart').toggle('slow');
            });

            // Toggle liferules checkboxes on or off
            $('#liferulestoggler').off().on('click', function () {
                $('#liferules').toggle('slow');
            });

            // Toggle bugrules checkboxes on or off
            $('#bugrulestoggler').off().on('click', function () {
                $('#bugrules').toggle('slow');
            });

            // Toggle text on or off
            $('#texttoggler').off().on('click', function () {
                $('#story').toggle('slow');
            });

            $('#datatoggler').off().on('click', function () {
                display.showData = !display.showData;
                $('#bugData').toggle('slow');
            });

            $('#liferules input').off().on('click', function () {
                conway.initLiferules();
            });

            controls.$startBugCount.val(buggers.startBugsCount);
            controls.$startBugCount.on('change', function () {
                buggers.startBugsCount = parseInt(controls.$startBugCount.val());
            });
            controls.$flockingPeers.val(buggers.flockingPeers);
            controls.$flockingPeers.on('change', function () {
                buggers.flockingPeers = parseInt(controls.$flockingPeers.val());
            });
            controls.$repellingDistance.val(buggers.repellingDistance);
            controls.$repellingDistance.on('change', function () {
                buggers.repellingDistance = parseInt(controls.$repellingDistance.val());
            });
            // init cellNutritionValue;
            display.$cellNutritionValue.val(buggers.cellNutritionValue);
            // Life cell nutrition value updaten
            display.$cellNutritionValue.on('change', function () {
                buggers.cellNutritionValue = parseInt(display.$cellNutritionValue.val());
            });


            $('canvas').on('mouseover', function () {
                display.showIds = true;
                interval = 250;
                display.dataCycle = 1;
                stopStartBugLife();
            });

            $('canvas').on('mouseout', function () {
                display.showIds = false;
                interval = 0;
                display.dataCycle = 10;
                stopStartBugLife();
            });

            // Fill livecells with your own mouse drawing
            $('#thetoroid').on('click', function (event) {
                let mouseX = Math.floor((event.offsetX ? (event.offsetX) : event.pageX - this.offsetLeft) / display.cellSize);
                let mouseY = Math.floor((event.offsetY ? (event.offsetY) : event.pageY - this.offsetTop) / display.cellSize);
                conway.liveCells.push(conway.celXY(mouseX, mouseY));
                display.drawCells();
                display.updateCellularData();
            });

            // Toggle bug data on or off
            if (display.showData) {
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
        prevSteps: 0,
        walkers: [],

        initLife: function () {
            this.spaceWidth = display.canvas.width / display.cellSize;
            this.spaceHeight = display.canvas.height / display.cellSize;
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
            conway.lifeSteps = 0;
            let i = 0;
            let $checkbox;
            for (; i < 10; i += 1) {
                $checkbox = $('#newlife' + i);
                if ($checkbox.length) {
                    this.liferules[i] = $checkbox.is(":checked");
                } else {
                    this.liferules[i] = false;
                }
            }
            i = 10;
            for (; i < 19; i += 1) {
                $checkbox = $('#staylife' + (i - 10));
                if ($checkbox.length) {
                    this.liferules[i] = $checkbox.is(":checked");
                } else {
                    this.liferules[i] = false;
                }
            }
        },

        // Put new pair of values in array
        celXY: function (x, y) {
            let cell = {
                x: x,
                y: y
            };
            return cell;
        },

        // Fill livecells with random cellxy's
        fillRandom: function () {
            const count = this.startnumberLivecells;
            let i = 0;
            for (; i < count; i += 1) {
                this.liveCells[i] = conway.celXY(Math.floor(Math.random() * this.spaceWidth), Math.floor(Math.random() * this.spaceHeight));
            }
        },

        // Calculate generations per second
        calcSpeed: function () {
            conway.speed = conway.lifeSteps - conway.prevSteps;
            conway.prevSteps = conway.lifeSteps;
        },

        // Set all neighbours to zero
        zeroNeighbours: function () {
            const count = this.numberCells;
            let i = 0;
            for (; i < count; i += 1) {
                this.neighbours[i] = 0;
            }
        },

        // Tell neighbours around livecells they have a neighbour
        countNeighbours: function () {
            const count = this.liveCells.length;
            const maxNeighbour = 2;
            let i = 0;
            for (; i < count; i += 1) {
                let thisx = this.liveCells[i].x;
                let thisy = this.liveCells[i].y;
                let dy = -1;
                for (; dy < maxNeighbour; dy += 1) {
                    let dx = -1;
                    for (; dx < maxNeighbour; dx += 1) {
                        this.neighbours[((thisy + dy) * this.spaceWidth + thisx + dx + this.numberCells) % this.numberCells] += 1;
                    }
                }
                this.neighbours[thisy * this.spaceWidth + thisx] += 9;
            }
        },

        // Evaluate neighbourscounts for new livecells
        evalNeighbours: function () {
            let self = this;

            function livecell() {
                let y = Math.floor(i / self.spaceWidth);
                let x = i - (y * self.spaceWidth);
                if (!buggers.eaten(x, y)) {
                    self.liveCells.push(conway.celXY(x, y));
                }
            }

            this.liveCells = [];
            const count = this.numberCells;
            let i = 0;
            for (; i < count; i += 1) {
                if (this.liferules[this.neighbours[i]]) {
                    livecell();
                }
            }
        },

        // Scatter the bug's fat around into lifecells
        scatter: function (bug) {
            let graveRadius = 50;
            let i = bug.fat * buggers.graveMultiplier;
            for (; i > 0; i -= 1) {
                let r = Math.random() * graveRadius + bug.maxRadius;
                let angle = Math.random() * TAU;
                let x = helpers.xWrap(bug.radius + Math.round(bug.x + Math.cos(angle) * r));
                let y = helpers.yWrap(bug.radius + Math.round(bug.y + Math.sin(angle) * r));
                conway.newLifeCells.push(conway.celXY(x, y));
            }
            bug.fat = 0;
        },

        addGlider: function (bug) {
            let poo = {},
                // determine glider with opposite direction of bug
                pooDirection = Math.round(((bug.direction + PI) % TAU) / PI * 4) % 8;
            cells = [];
            // console.log(pooDirection);
            poo.x = Math.round(Math.cos(bug.direction + PI) * (bug.radius + 2) + bug.x);
            poo.y = Math.round(Math.sin(bug.direction + PI) * (bug.radius + 2) + bug.y);
            var cells = conway.walkers[pooDirection].map(function (arr) {
                return arr.slice();
            });
            const count = cells.length;
            let i = 0;
            for (; i < count; i += 1) {
                if (cells.hasOwnProperty(i)) {
                    let cell = cells[i];
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
        birthFat: 1000,
        bugId: 1,
        bugs: [],
        cellNutritionValue: 4,
        flocking: $('.flock').is(":checked"),
        graveMultiplier: 10,
        flockingDistance: 50, // this.flockingDistance;
        flockingPeers: 7,
        repellingDistance: 10,
        maxBugsCount: 250,
        maxBugSteps: 10000, // then they die
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
            this.addBugs(this.startBugsCount);
        },

        // Draw the bugs
        drawBugs: function () {
            const count = buggers.bugs.length;
            let i = 0;
            for (; i < count; i += 1) {
                let thisBug = buggers.bugs[i];
                display.drawBug(thisBug);
            }
        },

        // Change gender of a bug if only one gender remains
        balanceGenders: function () {
            let males = this.maleCount;
            if (buggers.bugs.length > 1 && (males == 0 || males == buggers.bugs.length)) {
                // alternate 1 en 0
                let transgenderBug = buggers.bugs[0];
                if (!transgenderBug.pregnant) {
                    transgenderBug.flipGender();
                }
            }
        },

        // Check if a liveCell is 'in' a bug, if so, feed the bug
        eaten: function (x, y) {
            const count = buggers.bugs.length;
            let i = 0;
            for (; i < count; i += 1) {
                const thisBug = buggers.bugs[i];
                if (thisBug.overlaps(x, y)) {
                    thisBug.feed(thisBug.rightOrLeft(x, y));
                    return true;
                }
            }
            return false;
        },

        moveBugs: function () {
            const count = buggers.bugs.length;
            let i = 0;
            let deadBugs = [];
            for (; i < count; i += 1) {
                const thisBug = buggers.bugs[i];
                thisBug.buildActivityStack();
                if (!thisBug.alive) {
                    deadBugs.push(i);
                }
            }
            // Remove dead bugs
            let j = deadBugs.length - 1;
            for (; j >= 0; j -= 1) {
                buggers.bugs.splice(deadBugs[j], 1);
            }

            this.balanceGenders();
        },

        addBugs: function (amount) {
            let i = 0;
            for (; i < amount; i += 1) {
                let bug = new this.randomBug();
                bug.init();
                buggers.bugs.push(bug);
            }
        },

        giveBirth: function (mother) {

            let inheritFromFather = function (dad, child) {
                const properties = ['minRadius', 'poopSteps', 'turnSteps', 'flockingPeers', 'flockSteps', 'maxSteps'];
                const count = properties.length;
                let i = 0;
                for (; i < count; i += 1) {
                    const property = properties[i];
                    child[property] = Math.abs(Math.round(dad[property] + helpers.randomSign() * dad[property] / 10));
                }
            };

            let inheritFromMother = function (mom, child) {
                child.direction = mom.direction;
                child.turnAmount = helpers.fixedDecimals(Math.abs((mom.turnAmount + helpers.randomSign() * Math.random() * PI) % (TAU)));
                let besideDir = mom.direction + helpers.randomSign() * PI / 2;
                child.y = helpers.fixedDecimals(mom.y + Math.sin(besideDir) * (Math.random() * 20 + mom.radius));
                child.x = helpers.fixedDecimals(mom.x + Math.cos(besideDir) * (Math.random() * 20 + mom.radius));
                child.parentId = mom.id;
            };

            let inheritProperties = function (mom, dad, child) {
                // percentage from parents
                child.fat = Math.round((mom.fat + dad.fat) / 5);
                dad.fat = Math.round(dad.fat * 0.8);
                mom.fat = Math.round(mom.fat * 0.8);
                child.generation = oldestBug.generation + 1;
            };

            let father = buggers.bugs.filter(function (bug) {
                return bug.id === mother.partnerId;
            })[0];
            let oldestBug;

            let baby = new buggers.randomBug();
            inheritFromMother(mother, baby);

            if (father) {
                oldestBug = (mother.generation > father.generation) ? mother : father;
                inheritFromFather(father, baby);
                inheritProperties(mother, father, baby);
                father.offspring += 1;
            } else {
                oldestBug = mother;
                inheritFromFather(mother, baby);
                inheritProperties(mother, mother, baby);
            }


            buggers.bugs.push(baby);

            mother.offspring += 1;
            mother.partnerId = null;
            mother.pregnant = false;
            mother.recoverySteps = 0;
        },

        // If parent exists return it
        parent: function (momId) {
            let motherBug = $.grep(buggers.bugs, function (bug) { return bug.id == momId; });
            if (motherBug.length) {
                return motherBug[0];
            } else {
                return null;
            }
        },

        lastAdultBug: function () {
            let lastBug = buggers.bugs[0];
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
            let self = this;
            self.actionStack = [];
            self.alive = true;
            self.closeBugsAhead = [];
            self.fat = 0;
            self.flockingPeers = 7;
            self.foodLeft = 0;
            self.foodRight = 0;
            self.generation = 0;
            self.goldenRatio = 1.618;
            self.maxRadius = 15;
            self.minRadius = 0;
            self.direction = 0;
            self.flockSteps = 0;
            self.poopSteps = 0;
            self.turnSteps = 0;
            self.gender = helpers.random01();
            self.id = buggers.bugId += 1;
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
            self.alone = function () {
                return (buggers.bugs.length < 2);
            };
            self.burnFat = function () {
                self.fat -= Math.ceil(Math.log10(self.fat) / 3);
                self.radius = self.getRadius();
            };
            self.calcAngle = function (pos) {
                let dX = pos[0] - self.x;
                let dY = pos[1] - self.y;
                let angle = Math.atan2(dY, dX);
                return angle;
            };
            self.calcDistance = function (bug) {
                let dX = self.x - bug.x;
                let dY = self.y - bug.y;
                let distance = Math.sqrt(Math.pow((dX), 2) + Math.pow((dY), 2));
                return distance;
            };
            self.canWhelp = function () {
                return (self.recoverySteps > buggers.pregnancySteps || buggers.lastAdultBug()) &&
                    (self.fat > buggers.birthFat) &&
                    (self.gender == 0);
            };
            self.findClosestBugsInfront = function () {
                let closestBugs = [];
                let closestDistance = Infinity;
                const count = buggers.bugs.length;
                let i = 0;
                for (; i < count; i += 1) {
                    let thisBug = buggers.bugs[i];
                    if (self.differentBug(thisBug) && self.inFront(thisBug)) {
                        let distance = self.calcDistance(thisBug);
                        if (distance < closestDistance) {
                            closestBugs.push(thisBug);
                        }
                    }
                }
                return closestBugs.slice(-self.flockingPeers);
            };
            self.converge = function () {
                let targetOffset = 200;
                if (buggers.bugs.length > 1) {
                    let closestBugs = self.findClosestBugsInfront();
                    if (closestBugs.length > 1) {
                        let meanPoint = [0, 0];
                        let meanVector = [0, 0];
                        const count = closestBugs.length;
                        let i = 0;
                        for (; i < count; i += 1) {
                            let thisBug = closestBugs[i];
                            meanPoint[0] += thisBug.x;
                            meanPoint[1] += thisBug.y;
                            meanVector[0] += Math.cos(thisBug.direction);
                            meanVector[1] += Math.sin(thisBug.direction);
                        }
                        meanPoint[0] = Math.round(meanPoint[0] / closestBugs.length);
                        meanPoint[1] = Math.round(meanPoint[1] / closestBugs.length);
                        let meanAnle = Math.atan2(meanVector[1], meanVector[0]);
                        let meanTarget = [meanPoint[0] + Math.cos(meanAnle) * targetOffset, meanPoint[1] + Math.sin(meanAnle) * targetOffset];
                        let directionToTarget = self.calcAngle(meanTarget);
                        self.nudge(directionToTarget);
                    }
                }
            };
            self.differentBug = function (bug) {
                return self.id !== bug.id;
            };
            self.doDefecate = function () {
                return self.isPriority(self.poopSteps) && self.decent();
            };
            self.doDigest = function () {
                return (self.fat > buggers.minBugFat) && self.alive;
            };
            self.feed = function (right) {
                if (right) {
                    self.foodRight += 1;
                } else {
                    self.foodLeft += 1;
                }
                self.fat += buggers.cellNutritionValue;
            };
            self.feedOnParent = function () {
                let parentBug = buggers.parent(self.parentId);
                if (parentBug) {
                    parentBug.fat -= 1;
                    self.fat += 1;
                    self.direction = parentBug.direction;
                }
            };
            self.mateable = function (bug) {
                return self.oppositeGender(bug) && bug.adult() && !self.pregnant && !bug.pregnant;
            };
            self.fertilize = function (bug) {
                if (self.gender == 0) {
                    self.pregnant = true;
                    self.partnerId = bug.id;
                }
                if (bug.gender == 0) {
                    bug.pregnant = true;
                    bug.partnerId = self.id;
                }
            };
            self.findPartner = function () {
                let closestCandidatePartner = null;
                const bugCount = buggers.bugs.length;
                let closestDistance = Infinity;
                let i = 0;
                for (; i < bugCount; i += 1) {
                    let thisBug = buggers.bugs[i];
                    if (self.mateable(thisBug)) {
                        let distance = self.calcDistance(thisBug);
                        if (distance < closestDistance) {
                            closestCandidatePartner = thisBug;
                        }
                    }
                }
                return closestCandidatePartner;
            };
            self.flipGender = function () {
                self.gender = helpers.flipBit(self.gender);
            };
            self.getRadius = function () {
                // just pithagoras
                let newRadius = Math.sqrt(
                    Math.pow(self.maxSteps / 2, 2) -
                    Math.pow(self.steps - self.maxSteps / 2, 2)
                ) * 2 * self.maxRadius / self.maxSteps;
                return Math.round(newRadius);
            };
            self.headForPartner = function () {
                let candidate = self.findPartner();
                if (candidate) {
                    if (self.together(candidate)) {
                        self.fertilize(candidate);
                    } else {
                        let candidatePos = [candidate.x, candidate.y];
                        let candidateDirection = self.calcAngle(candidatePos);
                        self.nudge(candidateDirection);
                    }
                }
            };
            self.inConvergingRange = function (bug) {
                let distance = self.calcDistance(bug);
                let inRange = distance < buggers.flockingDistance;
                let inFront = bug.inFront(self);
                return inRange && inFront;
            };
            self.decent = function () {
                let decent = true;
                const count = buggers.bugs.length;
                let i = 0;
                for (; i < count; i += 1) {
                    const thisBug = buggers.bugs[i];
                    if (self.differentBug(thisBug)) {
                        decent = decent && !thisBug.inConvergingRange(self);
                    }
                }
                return decent;
            };
            self.inFront = function (bug) {
                let perpendicularAxis = function (x) {
                    let a = Math.tan(self.direction - PI / 2);
                    return a * (x - self.x) + self.y;
                };
                if (self.movingDown()) {
                    return bug.y < perpendicularAxis(bug.x);
                } else {
                    return bug.y > perpendicularAxis(bug.x);
                }
            };
            self.isAlive = function () {
                return (self.fat > buggers.minBugFat) && (self.steps < self.maxSteps) || (self.steps < 100);
            };
            self.isBaby = function () {
                return self.steps < self.newBornSteps;
            };
            self.isPriority = function (newSteps) {
                return self.steps % newSteps == 0;
            };
            self.buildActivityStack = function () {
                self.steps += 1;
                self.actionStack = [];
                self.alive = self.isAlive();
                self.recoverySteps += (self.pregnant) ? 1 : 0;

                if (self.canWhelp()) { self.actionStack.push('giveBirth'); }
                if (self.doDigest()) { self.actionStack.push('burnFat'); }
                if (self.doDefecate()) { self.actionStack.push('addGlider'); } //conway
                if (!self.alive) { self.actionStack.push('scatter'); } //conway
                if (self.watchCloseBugsAhead()) {
                    self.actionStack.push('turnAway');
                } else {
                    if (self.adult() && !self.alone()) {
                        self.actionStack.push('headForPartner');
                    } else {
                        if (self.isBaby()) {
                            self.actionStack.push('feedOnParent');
                        } else {
                            if (self.isPriority(self.flockSteps) && buggers.flocking) {
                                self.actionStack.push('converge');
                            } else {
                                if (self.isPriority(self.turnSteps)) {
                                    self.actionStack.push('reactToFood');
                                }
                            }
                        }
                    }
                }
                self.actionStack.push('advance');
                self.actionStack.reverse();

                self.applyActivityStack();
            };
            // bug is moving with decreasing y
            self.movingDown = function () {
                return Math.sin(self.direction) < 0;
            };
            self.movingToRight = function () {
                return Math.cos(self.direction) > 0;
            };
            self.applyActivityStack = function () {
                const count = self.actionStack.length;
                let i = 0;
                for (; i < count; i += 1) {
                    const fn = self.actionStack[i];
                    if (typeof self[fn] == 'function') {
                        self[fn].apply();
                    } else if (typeof buggers[fn] == 'function') {
                        buggers[fn].call(self, self);
                    } else if (typeof conway[fn] == 'function') {
                        conway[fn].call(self, self);
                    }
                }
            };
            // change self direction towards given direction a bit
            self.nudge = function (direction) {
                let tempDirection = helpers.positiveAngle(direction - self.direction);
                let nudgeAngle = PI / 32;
                if (tempDirection > PI) {
                    self.direction -= nudgeAngle;
                } else {
                    self.direction += nudgeAngle;
                }
                self.direction = helpers.positiveAngle(self.direction);
            };
            self.oppositeGender = function (bug) {
                return self.gender !== bug.gender;
            };
            self.reactToFood = function () {
                if (self.foodLeft !== self.foodRight) {
                    let right = self.foodRight > self.foodLeft;
                    self.turn(right);
                    self.foodRight = 0;
                    self.foodLeft = 0;
                }
            };
            self.rightOrLeft = function (x, y) {
                let bugAxis = Math.tan(self.direction) * x + self.y;
                if (self.movingToRight()) {
                    return y > bugAxis; // food was on the right side of self if true
                } else {
                    return y < bugAxis; // food was on the right side of self if true
                }
            };
            self.together = function (bug) {
                let minDistance = self.radius + bug.radius;
                let distance = self.calcDistance(bug);
                return distance < minDistance;
            };
            self.turn = function (right) {
                let sign = (right) ? 1 : -1;
                self.direction += (sign * self.turnAmount);
                self.direction = helpers.positiveAngle(self.direction);
            };
            self.turnAway = function () {
                let bugCount = self.closeBugsAhead.length;
                if (bugCount > 0) {
                    let xTotal = 0;
                    let yTotal = 0;
                    let meanPos = [];
                    let i = 0;
                    for (; i < bugCount; i += 1) {
                        let thisBug = self.closeBugsAhead[i];
                        xTotal += thisBug.x;
                        yTotal += thisBug.y;
                    }
                    meanPos[0] = xTotal / bugCount;
                    meanPos[1] = yTotal / bugCount;
                    let directionToMeanPos = self.calcAngle(meanPos);
                    self.nudge(directionToMeanPos - PI);
                }
            };
            self.watchCloseBugsAhead = function () {
                self.closeBugsAhead = [];
                const bugCount = buggers.bugs.length;
                let i = 0;
                for (; i < bugCount; i += 1) {
                    let thisBug = buggers.bugs[i];
                    if (self.differentBug(thisBug) && self.inFront(thisBug)) {
                        let minDistance = self.radius + thisBug.radius + buggers.repellingDistance;
                        let distance = self.calcDistance(thisBug);
                        if (distance < minDistance) {
                            self.closeBugsAhead.push(thisBug);
                        }
                    }
                }
                return (self.closeBugsAhead.length > 0);
            };
            self.overlaps = function (x, y) {
                return ((Math.pow(x - self.x, 2) + Math.pow(y - self.y, 2)) < Math.pow(self.radius, 2));
            };
            self.init = function () {
                self.direction = Math.random() * TAU;
                self.fat = 4 * buggers.minBugFat;
                self.flockSteps = 5 + Math.ceil(Math.random() * 10);
                self.gender = helpers.random01();
                self.maxSteps = buggers.maxBugSteps + helpers.randomSign() * Math.random() * 1000;
                self.minRadius = Math.ceil(Math.random() * 7);
                self.radius = self.minRadius;
                self.poopSteps = Math.ceil(Math.random() * 40 + 10);
                self.turnAmount = Math.random() * PI / 4;
                self.turnSteps = Math.ceil(Math.random() * 100);
                self.x = helpers.fixedDecimals((Math.random() * conway.spaceWidth) * display.cellSize, 2);
                self.y = helpers.fixedDecimals((Math.random() * conway.spaceHeight) * display.cellSize, 2);
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
            let decimalFactor = Math.pow(10, dec);
            // return dec -> fraction digits
            return Math.round(num * decimalFactor) / decimalFactor;
        },

        positiveAngle: function (angle) {
            return (angle + 4 * PI) % TAU;
        },

        xWrap: function (x) {
            return (x + display.canvas.width) % display.canvas.width;
        },

        yWrap: function (y) {
            return (y + display.canvas.height) % display.canvas.height;
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
        running = false,
        speedHandle = null;

    const PI = Math.PI,
        PHI = (1 + Math.sqrt(5)) / 2,
        TAU = PI * 2;

    // Set some variables
    function initVariables() {
        controls.initControls();
        display.initInterface();
        conway.initLife();
        buggers.initBugs();
    }

    function updateScreen() {
        display.fadeCells();
        display.drawCells();
        buggers.drawBugs();
        if (conway.lifeSteps % display.dataCycle == 0) {
            display.updateCellularData();
            if (display.showData) {
                display.showDataTable(buggers.bugs);
            }
        }
        if (display.showGraph) {
            display.drawGraph();
        }
        if (conway.lifeSteps % (display.canvas.width * display.xScale) == 0) {
            display.fadeGraph();
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
        if (display.canvas.getContext) {
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
        conway.lifeSteps = 0;
        conway.prevSteps = 0;
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
        conway.lifeSteps = 0;
        initVariables();
        display.updateCellularData();
    }

    firstStep();
    if (running === false) {
        startBugLife();
    }

    if (window.parent !== window) {
        // document is being loaded in an iframe
        $('body').addClass('isIframed');
    }

});

// TODO
// https://keep.google.com/#LIST/1514477052030.1526853250