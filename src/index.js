import domready from "domready"
import "./style.css"
import SimplexNoise from "simplex-noise"

const PHI = (1 + Math.sqrt(5)) / 2;
const TAU = Math.PI * 2;
const DEG2RAD_FACTOR = TAU / 360;

const config = {
    width: 0,
    height: 0
};

/**
 * @type CanvasRenderingContext2D
 */
let ctx;
let canvas;
let noise;


function arcpromixate(polygon)
{

    const length = polygon.length
    ctx.beginPath()

    let ccw = false
    for (let i = 0; i < length; i++)
    {
        const [x0, y0] = polygon[i]
        const [x1, y1] = polygon[i === 0 ? length - 1 : i - 1]

        const dx = x1 - x0
        const dy = y1 - y0

        const distance = Math.sqrt(dx * dx + dy * dy)
        const radius = distance / 2

        const mx = (x0 + x1) / 2
        const my = (y0 + y1) / 2

        const angle = Math.atan2(dy, dx)

        if (i === 0)
        {
            ctx.moveTo(
                mx + Math.cos(angle) * radius,
                my + Math.sin(angle) * radius,
            )

        }
        ctx.arc(
            mx,
            my,
            radius,
            angle,
            angle + TAU/2,
            ccw
        )
        ccw = !ccw
    }
    ctx.stroke()


}

const TARGET_DISTANCE = 100

const noiseScale = 0.005

function splitLine(out, x0, y0, x1, y1,id, detail)
{
    const dx = x1 - x0
    const dy = y1 - y0
    const distance = Math.sqrt(dx * dx + dy * dy)

    let mx = (x1 + x0) / 2
    let my = (y1 + y0) / 2

    const a = Math.atan2(dy,dx) - TAU/4
    const r = noise.noise3D(mx * noiseScale, my * noiseScale, id) * (distance / PHI )

    mx += Math.cos(a) * r
    my += Math.sin(a) * r

    if (detail > 0)
    {
        splitLine(out, x0, y0, mx, my, id, detail - 1)
    }

    out.push([Math.round(mx),Math.round(my)])

    if (detail > 0)
    {
        splitLine(out, mx, my, x1, y1, id, detail - 1)
    }
}


function split(polygon, id = 0, detail = 3)
{

    let newPolygon = []
    let length = polygon.length
    for (let i = 0; i < length; i++)
    {
        const [x0, y0] = polygon[i === 0 ? length - 1 : i - 1]
        const [x1, y1] = polygon[i]

        newPolygon.push([x0, y0])
        splitLine(newPolygon, x0, y0 ,x1, y1, id, detail)
        newPolygon.push([x1,y1])
    }

    return newPolygon
}


let activeRun = 0
domready(
    () => {

        canvas = document.getElementById("screen");
        ctx = canvas.getContext("2d");

        const width = (window.innerWidth) | 0;
        const height = (window.innerHeight) | 0;

        config.width = width;
        config.height = height;

        canvas.width = width;
        canvas.height = height;

        const cx = width >> 1
        const cy = height >> 1

        const paint = () => {

            const curr = ++activeRun

            noise = new SimplexNoise()

            const size = Math.min(width, height) * 0.36
            const size2 = size * 1.05
            const size3 = size * 1.12

            let id = 0
            let angle = 0
            let angle2 = 0

            ctx.fillStyle = "#000";
            ctx.fillRect(0,0, width, height);
            const animate = () => {

                ctx.globalCompositeOperation = "source-over"


                ctx.fillStyle = "rgba(0,0,0,0.02)";
                ctx.fillRect(0,0, width, height);

                ctx.globalAlpha = 0.9
                ctx.drawImage(
                    canvas,
                    0,0,
                    width-1,
                    height-1,
                    0,1,
                    width-1,
                    height-1,
                )


                ctx.globalAlpha = 1
                ctx.globalCompositeOperation = "lighten"
                ctx.lineWidth = 4
                ctx.lineJoin = "round"
                ctx.strokeStyle = "#f00";
                arcpromixate(

                    split(
                        [
                            [
                                cx + Math.cos(angle) * size,
                                cy + Math.sin(angle) * size,
                            ],
                            [
                                cx + Math.cos(angle + TAU/4) * size,
                                cy + Math.sin(angle + TAU/4) * size,
                            ],
                            [
                                cx + Math.cos(angle + TAU/2) * size,
                                cy + Math.sin(angle + TAU/2) * size,
                            ],
                            [
                                cx + Math.cos(angle + TAU*3/4) * size,
                                cy + Math.sin(angle + TAU*3/4) * size,
                            ]
                        ],
                        id
                    )
                )
                ctx.strokeStyle = "#0a0";
                arcpromixate(

                    split(
                        [
                            [
                                cx + Math.cos(angle) * size2,
                                cy + Math.sin(angle) * size2,
                            ],
                            [
                                cx + Math.cos(angle + TAU/4) * size2,
                                cy + Math.sin(angle + TAU/4) * size2,
                            ],
                            [
                                cx + Math.cos(angle + TAU/2) * size2,
                                cy + Math.sin(angle + TAU/2) * size2,
                            ],
                            [
                                cx + Math.cos(angle + TAU*3/4) * size2,
                                cy + Math.sin(angle + TAU*3/4) * size2,
                            ]
                        ],
                        id
                    )
                )
                ctx.strokeStyle = "#22f";
                arcpromixate(

                    split(
                        [
                            [
                                cx + Math.cos(angle) * size3,
                                cy + Math.sin(angle) * size3,
                            ],
                            [
                                cx + Math.cos(angle + TAU/4) * size3,
                                cy + Math.sin(angle + TAU/4) * size3,
                            ],
                            [
                                cx + Math.cos(angle + TAU/2) * size3,
                                cy + Math.sin(angle + TAU/2) * size3,
                            ],
                            [
                                cx + Math.cos(angle + TAU*3/4) * size3,
                                cy + Math.sin(angle + TAU*3/4) * size3,
                            ]
                        ],
                        id
                    )
                )

                id = Math.sin(angle2) * 0.5
                angle += 0.002
                angle2 += 0.003

                if (curr === activeRun)
                {
                    requestAnimationFrame(animate)
                }
            }
            requestAnimationFrame(animate)

        }

        paint()

        canvas.addEventListener("click", paint, true)
    }
);
