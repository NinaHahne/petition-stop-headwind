const $canvas = $("#canvas");
const canvas = document.getElementById("canvas");
const sigInput = document.getElementById("sig");

let ctx;
let mouseX, mouseY, mouseXstart, mouseYstart;

if (canvas) {
    ctx = canvas.getContext("2d");
    ctx.lineWidth = 2;
    ctx.strokeStyle = "midnightblue";

    $canvas.on("mouseenter", () => {
        $canvas.on("mousedown", e => {
            startSignature(e);
            // draw a circle on every mousedown:
            // drawCircle();
            drawDot();
            $canvas.on("mousemove", e => {
                drawLine(e);
            });
        });
        $canvas.on("mouseup", () => {
            saveSignature();
            $canvas.unbind("mousemove");
        });
        $canvas.on("mouseleave", () => {
            $canvas.unbind("mousemove");
        });
    });
}

function startSignature(e) {
    mouseXstart = e.pageX - e.target.offsetLeft;
    mouseYstart = e.pageY - e.target.offsetTop;
}

function saveSignature() {
    sigInput.value = canvas.toDataURL();
}

function drawLine(e) {
    mouseX = e.pageX - e.target.offsetLeft;
    mouseY = e.pageY - e.target.offsetTop;
    ctx.beginPath();
    ctx.moveTo(mouseXstart, mouseYstart);
    ctx.lineTo(mouseX, mouseY);
    ctx.stroke();
    mouseXstart = mouseX;
    mouseYstart = mouseY;
}

function drawCircle() {
    ctx.beginPath();
    ctx.arc(mouseXstart, mouseYstart, 20, 0, 2 * Math.PI);
    ctx.stroke();
}

function drawDot() {
    // ctx.fillRect(mouseXstart,mouseYstart,1,1);
    ctx.strokeRect(mouseXstart,mouseYstart,0.2,0.2);
}
