const imageFn: string = 'sample.jpg';

const canvasSize: number = 4000;

const toggleBorderStyle: string = "2px solid #009acc";

const magnifierSize: number = 160;
const magnifierStrokeWidth: number = 24;

const gridN: number = 24;
const gridWidth: number = 0.5;
const gridCollor: string = 'gray';

const collorTooltipCollor: string = "#8b8989";
const collorTooltipFont: string = "10px Arial";

const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
const toggle: HTMLElement = document.getElementById('toggle') as HTMLElement;
const color_info: HTMLElement = document.getElementById('color_info') as HTMLElement;
const selected_color_code: HTMLElement = document.getElementById('selected_color_code') as HTMLElement;
const selected_color: HTMLElement = document.getElementById('selected_color') as HTMLElement;
const current_color_code: HTMLElement = document.getElementById('current_color_code') as HTMLElement;
const current_color: HTMLElement = document.getElementById('current_color') as HTMLElement;

const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;
const img: HTMLImageElement = new Image();
img.src = imageFn;
let mouseX: number = 0;
let mouseY: number = 0;
let prevMouseX: number = 0;
let prevMouseY: number = 0;
let currentColor: string = '#FFFFFF';
let select: boolean = false;

const canvasDeamon: HTMLCanvasElement = document.createElement('canvas') as HTMLCanvasElement;
const ctxDeamon: CanvasRenderingContext2D = canvasDeamon.getContext('2d')!;
let imageData: ImageData;

function toggleSelect(): void {
    select = !select;
    canvas.style.cursor = select ? "none" : "auto";
    toggle.style.border = select ? toggleBorderStyle : '0px';
    color_info.style.display = select ? "flex" : 'none';
}

function rgbToHex(r: number, g: number, b: number): string {
    return ((r << 16) | (g << 8) | b).toString(16);
}

function clearMagnifier(): void {
    const mSize: number = magnifierSize + 2;
    const mX: number = prevMouseX - mSize / 2;
    const mY: number = prevMouseY - mSize / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(prevMouseX, prevMouseY, mSize / 2, 0, 2 * Math.PI);
    ctx.clip();

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, mX, mY, mSize, mSize, mX, mY, mSize, mSize);

    ctx.beginPath();
    ctx.arc(prevMouseX, prevMouseY, mSize / 2, 0, 2 * Math.PI);

    ctx.restore();
}

function drawMagnifier(): void {
    const mX: number = mouseX - magnifierSize / 2;
    const mY: number = mouseY - magnifierSize / 2;
    const cellSize: number = magnifierSize / (gridN - 1);

    ctx.save();
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, magnifierSize / 2, 0, 2 * Math.PI);
    ctx.clip();

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
        img,
        mouseX - gridN / 2 - 1,
        mouseY - gridN / 2 - 1,
        gridN - 1,
        gridN - 1,
        mX,
        mY,
        magnifierSize,
        magnifierSize
    );
    ctx.lineWidth = gridWidth;
    ctx.strokeStyle = gridCollor;

    // Draw horizontal lines
    for (let i = 0; i <= gridN; i++) {
        const y: number = mY + i * cellSize;
        ctx.beginPath();
        ctx.moveTo(mX, y);
        ctx.lineTo(mX + magnifierSize, y);
        ctx.stroke();
    }

    // Draw vertical lines
    for (let j = 0; j <= gridN; j++) {
        const x: number = mX + j * cellSize;
        ctx.beginPath();
        ctx.moveTo(x, mY);
        ctx.lineTo(x, mY + magnifierSize);
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(mouseX, mouseY, magnifierSize / 2, 0, 2 * Math.PI);

    ctx.lineWidth = magnifierStrokeWidth;
    ctx.strokeStyle = currentColor;
    ctx.stroke();

    ctx.lineWidth = 4;
    ctx.strokeStyle = 'white';
    ctx.stroke();

    // Draw square in the center
    ctx.beginPath();
    ctx.rect(
        mX + (gridN / 2 - 1) * cellSize - 1,
        mY + (gridN / 2 - 1) * cellSize - 1,
        cellSize + 2,
        cellSize + 2
    );
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'white';
    ctx.stroke();

    // Draw color tooltip
    ctx.beginPath();
    ctx.fillStyle = collorTooltipCollor;
    ctx.roundRect(
        mX + (gridN / 2 - 4) * cellSize +
        Math.max(0, 4 * cellSize - mouseX) -
        Math.max(0, 4 * cellSize - (canvas.width - mouseX)),
        mY + (gridN / 2 + 1 / 2) * cellSize -
        Math.max(0, 5 * cellSize - (canvas.height - mouseY)),
        7 * cellSize,
        2.5 * cellSize,
        4
    );
    ctx.fill();

    ctx.font = collorTooltipFont;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.fillText(
        currentColor.toUpperCase(),
        mouseX +
        Math.max(0, 4 * cellSize - mouseX) -
        Math.max(0, 4 * cellSize - (canvas.width - mouseX)),
        mouseY + 2.7 * cellSize -
        Math.max(0, 5 * cellSize - (canvas.height - mouseY))
    );

    ctx.restore();
}

function updateMousePosition(event: MouseEvent): boolean {
    const rect = canvas.getBoundingClientRect();
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
    if (imageData) {
        const p = imageData.data.subarray((mouseY * imageData.width + mouseX) * 4, (mouseY * imageData.width + mouseX) * 4 + 3);
        currentColor = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
    }
    current_color_code.innerHTML = currentColor.toUpperCase();
    current_color.style.backgroundColor = currentColor;

    return mouseX >= 0 && mouseX < canvas.width && mouseY >= 0 && mouseY < canvas.height;
}

function init() {

    img.onload = () => {
        canvas.width = img.width <= canvasSize ? img.width : canvasSize;
        canvas.height = img.height <= canvasSize ? img.height : canvasSize;
        ctx.drawImage(img, 0, 0);

        canvasDeamon.width = img.width;
        canvasDeamon.height = img.height;
        ctxDeamon.drawImage(img, 0, 0);
        imageData = ctxDeamon.getImageData(0, 0, canvasDeamon.width, canvasDeamon.height);

        canvas.addEventListener('mousemove', function (event) {
            const draw = updateMousePosition(event);
            clearMagnifier();
            if (draw && select) {
                drawMagnifier();
            }
        });
        canvas.addEventListener('mouseleave', function () {
            ctx.drawImage(img, 0, 0);
            current_color_code.innerHTML = '#FFFFFF';
            current_color.style.backgroundColor = '#FFFFFF';
        });
        canvas.addEventListener('click', function () {
            selected_color_code.innerHTML = currentColor.toUpperCase();
            selected_color.style.backgroundColor = currentColor;
        });
    };
}

init();
