// JavaScript Document
$(function () {
    var canvas = document.getElementById('thetoroid'), // The canvas where life is drawn
        graphcanvas = document.getElementById('thegraph'), // The canvas where the graph is drawn
        showGraph = false,
        $teller = $('#teller'),
        $cellsAlive = $('#cellsalive'),
        $speed = $('#speed'),
        cellsize = parseInt($('input[name=cellsizer]:checked').val(), 10), // Width and heigth of a cell in pixels
        spacewidth = (canvas.width / cellsize),
        spaceheight = (canvas.height / cellsize),
        numbercells = spacewidth * spaceheight, // Number of available cells
        livecells, // Array with x,y coordinates of living cells
        fillratio = 20, // Percentage of available cells that will be set alive initially
        startnumberlivecells = numbercells * fillratio / 100,
        yscale = 3 * graphcanvas.height / numbercells, //Ratio to apply values on y-axis
        cellsalive, // Number of cells alive
        neighbours, // Array with neighbours count
        steps = 0, // Number of iterations / steps done
        prevSteps = 0,
        interval = 0, // Milliseconds between iterations
        running = false,
        liferules = [],
        gogogo = null,
        speedHandle = null,
        speed = 0,
        bugs = [];

    // Set some variables
    function setspace() {
        cellsize = parseInt($('input[name=cellsizer]:checked').val(), 10); //Must be even or 1
        spacewidth = (canvas.width / cellsize);
        spaceheight = (canvas.height / cellsize);
        numbercells = spacewidth * spaceheight;
        startnumberlivecells = numbercells * fillratio / 100;
        cellsalive = startnumberlivecells;
    }

    // Empty the arrays to get ready for restart.
    function initarrays() {
        livecells = [];
        neighbours = [];
        bugs = [];
    }

    function initliferules() {
        var count;
        var $checkbox;
        for (count = 0; count < 10; count++) {
            $checkbox = $('#newlife' + count);
            if ($checkbox.length) {
                liferules[count] = $checkbox.is(":checked");
            } else {
                liferules[count] = false;
            }
        }
        for (count = 10; count < 19; count++) {
            $checkbox = $('#staylife' + (count - 10));
            if ($checkbox.length) {
                liferules[count] = $checkbox.is(":checked");
            } else {
                liferules[count] = false;
            }
        }
    }

    // Erase the canvas
    function clearspace() {
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Erase the graph
    function cleargraph() {
        var ctx = graphcanvas.getContext('2d');
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Put new pair of values in array
    function Celxy(x, y) {
        this.x = x;
        this.y = y;
    }

    // Fill livecells with random cellxy's
    function fillrandom() {
        var count;
        for (count = 0; count < startnumberlivecells; count++) {
            livecells[count] = new Celxy(Math.floor(Math.random() * spacewidth), Math.floor(Math.random() * spaceheight));
        }
    }

    // Fade the old screen a bit to white
    function fadeall() {
        var ctx = canvas.getContext('2d');
        if ($('.trails').is(":checked")) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        } else {
            ctx.fillStyle = "rgb(255, 255, 255)";
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Fade the old graph a bit to white
    function fadegraph() {
        var ctx = graphcanvas.getContext('2d');
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillRect(0, 0, graphcanvas.width, graphcanvas.height);
    }

    // Draw the array with livecells
    function drawcells() {
        var ctx = canvas.getContext('2d');
        var count;
        ctx.fillStyle = "rgb(128, 128, 0)";
        for (count in livecells) {
            ctx.fillRect(livecells[count].x * cellsize, livecells[count].y * cellsize, cellsize, cellsize);
        }
        cellsalive = livecells.length;
    }

    // Fill livecells with your own mouse drawing
    $('#thetoroid').click(function (event) {
        mouseX = Math.floor((event.offsetX ? (event.offsetX) : event.pageX - this.offsetLeft) / cellsize);
        mouseY = Math.floor((event.offsetY ? (event.offsetY) : event.pageY - this.offsetTop) / cellsize);
        livecells[livecells.length] = new Celxy(mouseX, mouseY);
        drawcells();
        updatedata();
    });

    // Draw the array with livecells
    function drawgraph() {
        var ctx = graphcanvas.getContext('2d');
        ctx.fillStyle = "rgb(128, 128, 0)";
        ctx.fillRect(steps % graphcanvas.width, graphcanvas.height - cellsalive * yscale, 1, 1);
    }

    // Calculate generations per second
    function calcSpeed() {
        speed = steps - prevSteps;
        prevSteps = steps;
    }

    // Update the counter
    function updatedata() {
        $teller.text(steps);
        $cellsAlive.text(cellsalive);
        $speed.text(speed);
    }

    // Set all neighbours to zero
    function zeroneighbours() {
        var count;
        for (count = 0; count < numbercells; count++) {
            neighbours[count] = 0;
        }
    }

    // Tell neighbours around livecells they have a neighbour
    function countneighbours() {
        var count, thisx, thisy, dx, dy;
        for (count in livecells) {
            thisx = livecells[count].x;
            thisy = livecells[count].y;
            for (dy = -1; dy < 2; dy++) {
                for (dx = -1; dx < 2; dx++) {
                    neighbours[((thisy + dy) * spacewidth + thisx + dx + numbercells) % numbercells]++;
                }
            }
            neighbours[thisy * spacewidth + thisx] += 9;
        }
    }

    // Evaluate neighbourscounts for new livecells
    function evalneighbours() {
        var count, thisx, thisy;

        function livecell() {
            thisy = Math.floor(count / spacewidth);
            thisx = count - (thisy * spacewidth);
            livecells.push(new Celxy(thisx, thisy));
        }

        livecells = [];
        for (count = 0; count < numbercells; count++) {
            if (liferules[neighbours[count]]) {
                livecell();
            }
        }
    }

    // Animation function
    function animateShape() {
        steps += 1;
        zeroneighbours();
        countneighbours();
        evalneighbours();
        fadeall();
        drawcells();
        if (showGraph) {
            drawgraph();
        }
        updatedata();
    }

    function firststep() {
        if (canvas.getContext) {
            setspace();
            yscale = 3 * graphcanvas.height / numbercells;
            initarrays();
            initliferules();
            clearspace();
            fillrandom();
            drawcells();
            fadegraph();
        } else {
            // canvas-unsupported code here
            document.write("If you see this, you&rsquo;d better install Firefox or Chrome or Opera or Safari or &hellip;");
        }
    }

    // Set space dimensions when user chooses other cellsize
    $('form .cellsizer').change(function () {
        setspace();
        clearspace();
        drawcells();
    });

    // Do one life step
    function steplife() {
        animateShape();
    }
    $('#stepbutton').click(function () {
        steplife();
    });
    shortcut.add("right", function () {
        steplife();
    });

    function setIntervals() {
        gogogo = setInterval(animateShape, interval);
        speedHandle = setInterval(calcSpeed, 1000);
    }

    function clearIntervals() {
        clearInterval(gogogo);
        clearInterval(speedHandle);
    }

    // Start life animation
    function startlife() {
        $('.trails').attr('checked', true);
        if (running === false) {
            setIntervals();
        }
        running = true;
    }
    $('#startbutton').click(function () {
        startlife();
    });
    shortcut.add("up", function () {
        startlife();
    });

    // Show start button again after user clicked stopbutton
    function stoplife() {
        clearIntervals();
        running = false;
    }
    $('#stopbutton').click(function () {
        stoplife();
    });
    shortcut.add("down", function () {
        stoplife();
    });

    // Restart everything when user clicks restart button
    function restartlife() {
        if (running === true) {
            clearIntervals();
        }
        running = false;
        steps = 0;
        prevSteps = 0;
        firststep();
        $('.trails').attr('checked', true);
        if (running === false) {
            setIntervals();
        }
        running = true;
    }
    $('#randombutton').click(function () {
        restartlife();
    });
    shortcut.add("return", function () {
        restartlife();
    });

    // Clear the canvas (in order to draw manually on it)
    function clearlife() {
        if (running === true) {
            clearIntervals();
        }
        running = false;
        steps = 0;
        setspace();
        initarrays();
        clearspace();
        updatedata();
    }
    $('#clearbutton').click(function () {
        clearlife();
    });
    shortcut.add("delete", function () {
        clearlife();
    });

    // Toggle trails on or off
    shortcut.add("insert", function () {
        if ($('.trails').is(":checked")) {
            $('.trails').attr('checked', false);
        } else {
            $('.trails').attr('checked', true);
        }
    });

    // Toggle graph on or off
    $('#graphtoggler').click(function () {
        showGraph = !showGraph;
        $('#thegraph').toggle('slow');
    });

    // Toggle liferules checkboxes on or off
    $('#rulestoggler').click(function () {
        $('#liferules').toggle('slow');
    });

    // Toggle text on or off
    $('#texttoggler').click(function () {
        $('#story').toggle('slow');
    });

    $('#liferules input').click(function () {
        initliferules();
    });

    firststep();
    if (running === false) {
        setIntervals();
    }
    running = true;

});	
