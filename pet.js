const petSettingsStr = localStorage.getItem("settings");
const petDefaultSettings = { pet: true, petType: 'cat', petSize: 64, petFreq: 50 };
const petSettingsJSON = petSettingsStr ? Object.assign(petDefaultSettings, JSON.parse(petSettingsStr)) : petDefaultSettings;

if (petSettingsJSON.pet) {
    const petType = petSettingsJSON.petType || 'cat';
    const petSize = parseInt(petSettingsJSON.petSize) || 64;
    const petFreq = parseInt(petSettingsJSON.petFreq) || 50;

    // Freq multiplier (10 to 100 transforms to ~0.2x to 2.0x modifier)
    const freqMod = petFreq / 50;

    // Pets behavior & rendering configuration
    const petsConfig = {
        cat: {
            colors: { ' ': null, 'b': '#000000', 'o': '#e87818', 'w': '#ffffff', 'p': '#ffadd6', 'r': '#ff3333' },
            thoughts: ["Meow~", "Prrrr...", "Need treats.", "Beautiful day!", "*stretches*", "So sleepy...", "Catch the mouse!", "Feed me?", "I love you!", "Purrrr...", "Where is fish?", "Tap me!", "Good human."],
            speech: { jump: "Boing!", play: ["*bat*", "*swat*"], sleep: "Zzz...", wake: "Yawn... what?", pet: "Prrr... ❤️" },
            frames: {
                idle: [
                    "                ", "  b        b    ", "  bb      bb    ", "  bob    bob    ", "  boobbbboob    ", " bboooooooobb   ", " bowbboobbowb   ", " bowwboobwwob   ",
                    " bowpwwwwpwob   ", "  bwwoooowwb    ", " bboooooooobb   ", " boooowwoooob b ", " boooowwooobb b ", " bbwwbbwwbb b b ", "   bb  bb   bbb ", "                "
                ],
                walk1: [
                    "                ", "  b        b    ", "  bb      bb    ", "  bob    bob    ", "  boobbbboob    ", " bboooooooobb   ", " bowbboobbowb   ", " bowwboobwwob   ",
                    " bowpwwwwpwob   ", "  bwwoooowwb    ", " bbbooooooobbbb ", " bwwooowwooowwb ", " bwwooowwooowwb ", " bbbwwbbbwwbbbb ", "    bb   bb     ", "                "
                ],
                walk2: [
                    "                ", "  b        b    ", "  bb      bb    ", "  bob    bob    ", "  boobbbboob    ", " bboooooooobb   ", " bowbboobbowb   ", " bowwboobwwob   ",
                    " bowpwwwwpwob   ", "  bwwoooowwb    ", " bboooooooobb   ", " boooowwoooob   ", " boooowwooobb b ", " bbwwbbwwbbbb b ", "   bb  bb   bbb ", "                "
                ],
                sit: [
                    "                ", "                ", "  b        b    ", "  bb      bb    ", "  bob    bob    ", "  boobbbboob    ", " bboooooooobb   ", " bowbboobbowb   ",
                    " bowwboobwwob   ", " bowpwwwwpwob   ", "  bwwoooowwb b  ", " bboooooooobbb  ", " boooowwoooobb  ", " bwwbbbbbbwwbb  ", " bbb      bbbb  ", "                "
                ],
                jump: [
                    "  b        b    ", "  bb      bb    ", "  bob    bob    ", "  boobbbboob    ", " bboooooooobb   ", " bowbboobbowb   ", " bowwboobwwob   ", " bowpwwwwpwob   ",
                    "  bwwoooowwb    ", " bboooooooobb   ", " boooowwoooob b ", " bwooowwooobb b ", " bbwbbbbbwbb  b ", "   b     b    b ", "                ", "                "
                ],
                sleep: [
                    "                ", "                ", "                ", "                ", "                ", "                ", "     b    b     ", "    bwb  bwb    ",
                    "   bbpbbbbpbb   ", "  bboooooooobb  ", " bboooooooowoob ", " bowwooooowwwob ", " bbwbbbbbbwwwbb ", "  bb      bbbb  ", "                ", "                "
                ],
                play: [
                    "                ", "  b        b    ", "  bb      bb    ", "  bob    bob    ", "  boobbbboob    ", " bboooooooobb   ", " bowbboobbowb   ", " bowwboobwwob r ",
                    " bowpwwwwpwob r ", "  bwwoooowwb    ", " bboooooooobb   ", " boooowwoooob   ", " boooowwooobb   ", " bbwwbbwwbb b   ", "   bb  bb   b   ", "                "
                ]
            }
        },
        dog: {
            colors: { ' ': null, 'b': '#000000', 'w': '#ffffff', 'l': '#c27c3a', 'd': '#7a4214', 'p': '#ffadd6', 'r': '#33cc33' },
            thoughts: ["Woof!", "Bark!", "Throw the ball?", "*pant pant*", "Good boy?", "Belly rubs!", "Squirrel!", "Sniff sniff..."],
            speech: { jump: "Woof!", play: ["*pant*", "*chew*"], sleep: "Zzz... ruff", wake: "Wha-?", pet: "*happy pant* ❤️" },
            frames: {
                idle: [
                    "                ", "   bb      bb   ", "  bldb    bdlb  ", " bbddbbbbbbddbb ", " bldddlllldddlb ", " bddbllllllbddb ", " bdwwbllllbwwdb ", " bbwbllllllbwbb ",
                    "  bwwbllllbwwb  ", "  bbwpllllpwbb  ", " bbbllllllllbbb ", " bllwwllllwwllb ", "  bllbbllbbllb  ", "  bllbbllbbllb  ", "   bb  bb  bb   ", "                "
                ],
                walk1: [
                    "                ", "   bb      bb   ", "  bldb    bdlb  ", " bbddbbbbbbddbb ", " bldddlllldddlb ", " bddbllllllbddb ", " bdwwbllllbwwdb ", " bbwbllllllbwbb ",
                    "  bwwbllllbwwb  ", "  bbwpllllpwbb b", " bbllllllllbbbbb", " blwwllllwwlb  b", " bllbbbllbb     ", " bbb bbllbb     ", "     bbb bb     ", "                "
                ],
                walk2: [
                    "                ", "   bb      bb   ", "  bldb    bdlb  ", " bbddbbbbbbddbb ", " bldddlllldddlb ", " bddbllllllbddb ", " bdwwbllllbwwdb ", " bbwbllllllbwbb ",
                    "  bwwbllllbwwb  ", "  bbwpllllpwbb  ", " bbbllllllllbbb ", " bllwwllllwwllbb", "  bllbbllbbllb b", "  bllbbllbbllbbb", "   bb  bb  bbbb ", "                "
                ],
                sit: [
                    "                ", "                ", "                ", "   bb      bb   ", "  bldb    bdlb  ", " bbddbbbbbbddbb ", " bldddlllldddlb ", " bddbllllllbddb ",
                    " bdwwbllllbwwdb ", " bbwbllllllbwbb ", " bbbwbllbwbwbbb ", "  bwwplbpwwbb   ", "  blllbbllllbb  ", " blbllllllblbbb ", " bbbbbbbbbbbbb  ", "                "
                ],
                jump: [
                    "   bb      bb   ", "  bldb    bdlb  ", " bbddbbbbbbddbb ", " bldddlllldddlb ", " bddbllllllbddb ", " bdwwbllllbwwdb ", " bbwbllllllbwbb ", "  bwwbllllbwwb  ",
                    "  bbwpllllpwbb b", " bbllllllllbbbbb", " blwwllllwwlllbb", " blbbllllbbllbb ", " bb  bbbb  bbb  ", "                ", "                ", "                "
                ],
                sleep: [
                    "                ", "                ", "                ", "                ", "                ", "                ", "    bb          ", "  bbdwb         ",
                    " bbdddlbbb      ", " bddllllllbbb   ", " bdwwllllldddbb ", "  bddddddddddbb ", "  bbbbbbbbbbbbb ", "                ", "                ", "                "
                ],
                play: [
                    "                ", "                ", "                ", "   bb      bb   ", "  bldb    bdlb  ", " bbddbbbbbbddbb ", " bldddlllldddlb ", " bddbllllllbddb ",
                    " bdwwbllllbwwdb ", " bbwbllllllbwbb ", " bbbwbllbwbwbbb ", "  bwwplbpwwbbrr ", "  blllbbllllbbr ", " blbllllllblbbb ", " bbbbbbbbbbbbb  ", "                "
                ]
            }
        },
        rabbit: {
            colors: { ' ': null, 'b': '#000000', 'w': '#ffffff', 'p': '#ffadd6', 'r': '#ff9900' },
            thoughts: ["*sniff sniff*", "Hop hop!", "Where's the carrot?", "Fluffy...", "Can I eat that?", "*twitch nose*"],
            speech: { jump: "Hop!", play: ["*nibble*", "*munch*"], sleep: "Zzz... carrot", wake: "*twitch*", pet: "*happy thumps* ❤️" },
            frames: {
                idle: [
                    "   bb       bb  ", "  bwwb     bwwb ", "  bwpb     bwpb ", "  bwpb     bwpb ", "  bwwb     bwwb ", " bbbwbbbbbwbwwb ", " bwwwwwwwwwwwwb ", " bwwbwwwwwbwwwb ",
                    " bwbbwwwwwwbbwb ", " bwpwwwwwwwwpwb ", "  bbwwwwwwwwbb  ", "  bwwwwwwwwwwb  ", "  bwwwwwwwwwwbbb", "  bwbbwwwwwbbwbb", "  bbb bbbbb bb  ", "                "
                ],
                walk1: [
                    "   bb       bb  ", "  bwwb     bwwb ", "  bwpb     bwpb ", "  bwpb     bwpb ", "  bwwb     bwwb ", " bbwbbbbbbbwwbb ", " bwwwwwwwwwwwwb ", " bwwbwwwwwbwwwb ",
                    " bwbbwwwwwwbbwb ", " bwpwwwwwwwwpwb ", "  bbwwwwwbwwbb  ", "  bwwbwbbbwwb   ", " bbwwbb bbbwbb  ", "  bbbb    bbb   ", "                ", "                "
                ],
                walk2: [
                    "   bb       bb  ", "  bwwb     bwwb ", "  bwpb     bwpb ", "  bwpb     bwpb ", "  bwwb     bwwb ", " bbbwbbbbbwbwwb ", " bwwwwwwwwwwwwb ", " bwwbwwwwwbwwwb ",
                    " bwbbwwwwwwbbwb ", " bwpwwwwwwwwpwb ", "  bbwwwwwwwwbb  ", " bwwbwwwwwbwwb  ", " bwwbwwwwwwbbbb ", " bbbbwwwwwbwbbb ", "    bbbbbbb bb  ", "                "
                ],
                sit: [
                    "                ", "   bb       bb  ", "  bwwb     bwwb ", "  bwpb     bwpb ", "  bwpb     bwpb ", "  bwwb     bwwb ", " bbbwbbbbbwbwwb ", " bwwwwwwwwwwwwb ",
                    " bwwbwwwwwbwwwb ", " bwbbwwwwwwbbwb ", " bwpwwwwwwwwpwb ", "  bbwwwwwwwwbb  ", "  bwwwwwwwwwb   ", " bbbbbbbbbbbbbb ", "                ", "                "
                ],
                jump: [
                    "                ", "                ", "  bwwb      bwwb", " bbwbbbbbbbbwwbb", " bwwwwwwwwwwwwwb", " bwpbwwwwwbwpwwb", " bwbbwwwwwwbbwwb", " bwpwwwwwwwwpwwb",
                    "  bbwwwwwwwwbbww", "  bwwwwwwwwwwb b", "  bwwwwwwwwwbb b", "  bbwwbbbwwwbb b", "   bbb   bbb bbb", "                ", "                ", "                "
                ],
                sleep: [
                    "                ", "                ", "                ", "                ", "                ", "     bbbbbbbb   ", "    bwwwwwwwwb  ", "   bbbbwwwwwbbb ",
                    "  bwwpbbwwbbwpwb", "  bwwwwbwwbwwwwb", "   bwwwwwwwwwwb ", "    bwwwwwwwwb  ", "    bbbbbbbbbb  ", "                ", "                ", "                "
                ],
                play: [
                    "                ", "   bb       bb  ", "  bwwb     bwwb ", "  bwpb     bwpb ", "  bwpb     bwpb ", "  bwwb     bwwb ", " bbbwbbbbbwbwwb ", " bwwwwwwwwwwwwb ",
                    " bwwbwwwwwbwwwb ", " bwbbwwwwwwbbwbr", " bwpwwwwwwwwpwbr", "  bbwwwwwwwwbb  ", "  bwwwwwwwwwb   ", " bbbbbbbbbbbbbb ", "                ", "                "
                ]
            }
        },
        hamster: {
            colors: { ' ': null, 'b': '#000000', 'w': '#ffffff', 'l': '#e2b571', 'p': '#ffaec0', 's': '#d5d5d5' },
            thoughts: ["*squeak*", "Need seeds...", "Run run run!", "Chubby cheeks.", "*sniff*", "I'm smol."],
            speech: { jump: "Wii!", play: ["*crunch*", "*munch*"], sleep: "Zzz... squeak", wake: "*gasp*", pet: "*squeak* ❤️" },
            frames: {
                idle: [
                    "                ", "                ", "                ", "    bb    bb    ", "   bllb  bllb   ", "  bbllbbbbllbb  ", "  blllwwwwlllb  ", " bllwwbbbwwwllb ",
                    " bllwwbpwbwwllb ", " blllwwwwwwlllb ", " bbllbbssbbllbb ", " bpblbssssblbpb ", " bpblllsslllbpb ", " bpblllllwwbpb  ", "  bbbbbbbbbbb   ", "                "
                ],
                walk1: [
                    "                ", "                ", "                ", "    bb    bb    ", "   bllb  bllb   ", "  bbllbbbbllbb  ", "  blllwwwwlllb  ", " bllwwbbbwwwllb ",
                    " bllwwbpwbwwllb ", " blllwwwwwwlllb ", " bbllbbbbbbllbb ", "  bblbssssblbb  ", " bpbbllsslllbbp ", "  bbbbbllwwbbb  ", "   bbbbbbbbbb   ", "                "
                ],
                walk2: [
                    "                ", "                ", "                ", "    bb    bb    ", "   bllb  bllb   ", "  bbllbbbbllbb  ", "  blllwwwwlllb  ", " bllwwbbbwwwllb ",
                    " bllwwbpwbwwllb ", " blllwwwwwwlllb ", " bbllbbbbbbllbb ", "  bblbssssblbb  ", " pbbllsslllbbpb ", "  bbbwwllwwbbb  ", "   bbbbbbbbbb   ", "                "
                ],
                sit: [
                    "                ", "                ", "                ", "                ", "    bb    bb    ", "   bllb  bllb   ", "  bbllbbbbllbb  ", "  blllwwwwlllb  ",
                    " bllwwbbbwwwllb ", " bllwwbpwbwwllb ", " blllwwwwwwlllb ", " bbllbbssbbllbb ", " bpblbssssblbpb ", " bpbwwwwwlllbpb ", " bbbbbbbbbbbbb  ", "                "
                ],
                jump: [
                    "                ", "                ", "    bb    bb    ", "   bllb  bllb   ", "  bbllbbbbllbb  ", "  blllwwwwlllb  ", " bllwwbbbwwwllb ", " bllwwbpwbwwllb ",
                    " blllwwwwwwlllb ", " bbllbbssbbllbb ", "  bblbssssblbb  ", " bpbwwwwwllbpb  ", "  bbbbbbbbbbb   ", "                ", "                ", "                "
                ],
                sleep: [
                    "                ", "                ", "                ", "                ", "                ", "                ", "     bbbbbbbb   ", "   bbllllllllb  ",
                    "  bllwlwwwwwllb ", "  bwwblllllwwlb ", "  bllwwwwwlwwlb ", "   bbbbbbbbbbb  ", "                ", "                ", "                ", "                "
                ],
                play: [
                    "                ", "                ", "                ", "                ", "    bb    bb    ", "   bllb  bllb   ", "  bbllbbbbllbb  ", "  blllwwwwlllb  ",
                    " bllwwbbbwwwllb ", " bllwwbpwbwwllb ", " blllwwwwwwlllb ", " bbllbbbbbbllbb ", " bpblssbsssblpb ", " bpbssssssssbpb ", " bbbbbbbbbbbbb  ", "                "
                ]
            }
        },
        bird: {
            colors: { ' ': null, 'b': '#000000', 'B': '#38a0ed', 'D': '#115f9b', 'y': '#fbb301', 'w': '#ffffff', 'r': '#8c5936' },
            thoughts: ["Tweet!", "Chirp chirp~", "Singing a song~", "Need seed.", "Flap flap.", "Look at me!"],
            speech: { jump: "Flap!", play: ["*peck*", "*toss*"], sleep: "Zzz... tweet", wake: "Chirp?!", pet: "Tweet! ❤️" },
            isFlying: true,
            frames: {
                idle: [
                    "                ", "                ", "     bbbb       ", "   bbBBBBbb     ", "  bBBBwBbBBb    ", "  bBBbbBbByy    ", " bBBBbbBBByyb   ", " bBBBbBBBBb b   ",
                    " bBBBBBBBBb     ", " bBbbBBBBbb     ", "  bbbDDbbb      ", "    bb b        ", "   bbb bbb      ", "                ", "                ", "                "
                ],
                walk1: [
                    "                ", "                ", "     bbbb       ", "   bbBBBBbb     ", "  bBBBwBbBBb    ", "  bBBbbBbByy    ", " bBBBbbBBByyb   ", " bBBBbBBBBb b   ",
                    " bBBBBBBBBb     ", " bBbbBBBBbb     ", "  bbbDDbbb      ", "    b  b        ", "   bbb  bbb     ", "                ", "                ", "                "
                ],
                walk2: [
                    "                ", "                ", "     bbbb       ", "   bbBBBBbb     ", "  bBBBwBbBBb    ", "  bBBbbBbByy    ", " bBBBbbBBByyb   ", " bBBBbBBBBb b   ",
                    " bBBBBBBBBb     ", " bBbbBBBBbb     ", "  bbbDDbbb      ", "      bb b      ", "     bbb bbb    ", "                ", "                ", "                "
                ],
                sit: [
                    "                ", "                ", "     bbbb       ", "   bbBBBBbb     ", "  bBBBwBbBBb    ", "  bBBbbBbByy    ", " bBBBbbBBByyb   ", " bBBBbBBBBb b   ",
                    " bBBBBBBBBb     ", " bbbDDDDbbb     ", "   bbbbbb       ", "                ", "                ", "                ", "                ", "                "
                ],
                jump: [
                    "                ", "     bbbb       ", "   bbBBBBbb     ", "  bBBBwBbBBb    ", " bbbBBbbBbByy   ", " bDbbBBbbBByyb  ", " bDDbBBBbBBb b  ", " bDbbBBBBBBb    ",
                    "  bbbBbbBBbb    ", "    bbbbbb      ", "                ", "                ", "                ", "                ", "                ", "                "
                ],
                sleep: [
                    "                ", "                ", "                ", "                ", "                ", "      bbbb      ", "    bbBBBBbb    ", "   bBBBBBBBBb   ",
                    "  bBBbbBBBbbBb  ", "  bBBbBBBBbBBb  ", "  bbbbbbbbbbbb  ", "                ", "                ", "                ", "                ", "                "
                ],
                play: [
                    "                ", "                ", "     bbbb       ", "   bbBBBBbb     ", "  bBBBwBbBBb    ", "  bBBbbBbByy  r ", " bBBBbbBBByyb r ", " bBBBbBBBBb b r ",
                    " bBBBBBBBBb   r ", " bBbbBBBBbb     ", "  bbbDDbbb      ", "    bb b        ", "   bbb bbb      ", "                ", "                ", "                "
                ]
            }
        }
    };

    const myPet = petsConfig[petType] || petsConfig['cat'];

    // Render tree if bird is selected
    if (myPet.isFlying) {
        const treeCanvas = document.createElement('canvas');
        treeCanvas.width = 150;
        treeCanvas.height = 300;
        treeCanvas.style.position = 'fixed';
        treeCanvas.style.bottom = '0';
        treeCanvas.style.right = '50px';
        treeCanvas.style.zIndex = '999'; // behind bird
        treeCanvas.style.imageRendering = 'pixelated';
        treeCanvas.style.opacity = '0.9';
        treeCanvas.style.pointerEvents = 'none';

        const tctx = treeCanvas.getContext('2d');
        const trunkColor = '#5c4033';
        const leafColor = '#228b22';

        // Draw trunk
        tctx.fillStyle = trunkColor;
        tctx.fillRect(60, 150, 30, 150);

        // Draw leaves pixel style (large blocks)
        tctx.fillStyle = leafColor;
        tctx.fillRect(40, 110, 70, 70);
        tctx.fillRect(20, 140, 110, 40);
        tctx.fillRect(30, 80, 90, 40);
        tctx.fillRect(50, 50, 50, 30);

        document.body.appendChild(treeCanvas);
    }

    const petStyles = document.createElement('style');
    petStyles.innerHTML = `
        #virtual-pet-container {
            position: fixed;
            bottom: 0;
            left: 50%;
            z-index: 1000;
            cursor: pointer;
            width: ${petSize}px;
            height: ${petSize}px;
            pointer-events: auto;
            transform: translateX(-50%);
        }
        #virtual-pet-canvas {
            width: 100%;
            height: 100%;
            image-rendering: pixelated;
        }
        #virtual-pet-bubble {
            position: fixed;
            background: var(--bg-primary, white);
            color: var(--text-color, black);
            border: 2px solid var(--border-color, #ccc);
            padding: 8px 12px;
            border-radius: 12px;
            font-size: 13px;
            font-family: inherit;
            pointer-events: none;
            z-index: 1001;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            opacity: 0;
            transition: opacity 0.3s ease;
            white-space: nowrap;
            font-weight: bold;
            transform: translate(-50%, -100%);
        }
        #virtual-pet-bubble::after {
            content: '';
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            border-width: 6px 6px 0;
            border-style: solid;
            border-color: var(--bg-primary, white) transparent transparent transparent;
        }
        #virtual-pet-bubble::before {
            content: '';
            position: absolute;
            bottom: -9px;
            left: 50%;
            transform: translateX(-50%);
            border-width: 8px 8px 0;
            border-style: solid;
            border-color: var(--border-color, #ccc) transparent transparent transparent;
        }
        #virtual-pet-heart {
            position: fixed;
            color: #ff4d4d;
            font-size: 24px;
            pointer-events: none;
            z-index: 1002;
            opacity: 0;
            transition: all 1s ease-out;
            text-shadow: 0 0 5px rgba(255, 77, 77, 0.5);
            transform: translate(-50%, -50%);
        }
        body.dark #virtual-pet-bubble {
            background: #2a2a2a;
            color: #f0f0f0;
            border-color: #444;
        }
        body.dark #virtual-pet-bubble::after { border-top-color: #2a2a2a; }
        body.dark #virtual-pet-bubble::before { border-top-color: #444; }
    `;
    document.head.appendChild(petStyles);

    const container = document.createElement('div');
    container.id = 'virtual-pet-container';

    const canvas = document.createElement('canvas');
    canvas.id = 'virtual-pet-canvas';
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    const bubble = document.createElement('div');
    bubble.id = 'virtual-pet-bubble';

    const heart = document.createElement('div');
    heart.id = 'virtual-pet-heart';
    heart.innerHTML = '❤️';

    container.appendChild(canvas);
    document.body.appendChild(container);
    document.body.appendChild(bubble);
    document.body.appendChild(heart);

    function drawFrame(frameKey, facingRight = true) {
        ctx.clearRect(0, 0, 32, 32);
        const data = myPet.frames[frameKey];

        ctx.save();
        if (!facingRight) {
            ctx.translate(32, 0);
            ctx.scale(-1, 1);
        }

        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                const char = data[y][x];
                if (myPet.colors[char]) {
                    ctx.fillStyle = myPet.colors[char];
                    ctx.fillRect(x * 2, y * 2, 2, 2);
                }
            }
        }
        ctx.restore();
    }

    let state = 'idle';
    let petX = window.innerWidth / 2;
    let petY = 0; // Altitude, handling flying
    let targetX = petX;
    let targetY = 0;

    // Birds naturally sit higher
    const baseAltitude = myPet.isFlying ? 120 : 0;
    petY = baseAltitude;
    targetY = baseAltitude;

    let facingRight = true;
    let walkPhase = 0;
    let walkTimer = 0;

    let sleepTimer = 0;
    let actionTimer = 0;
    let actionPhase = 0;

    let bubbleTimeout;
    function say(text, duration = 3000) {
        bubble.textContent = text;
        bubble.style.opacity = '1';
        bubble.style.left = petX + 'px';
        bubble.style.bottom = (petSize + 15) + 'px';

        clearTimeout(bubbleTimeout);
        bubbleTimeout = setTimeout(() => {
            bubble.style.opacity = '0';
        }, duration);
    }

    function updateBubblePosition() {
        if (bubble.style.opacity === '1') {
            bubble.style.left = petX + 'px';
            bubble.style.bottom = (petSize + petY + 15) + 'px'; // adjust for altitude
        }
    }

    function updatePet() {
        if (state === 'sitting') return;

        if (state === 'sleeping') {
            if (Math.random() < 0.05 * freqMod && Math.random() < 0.1) {
                say(myPet.speech.sleep, 2000);
            }
            return;
        }

        if (state === 'jumping') {
            actionTimer++;
            const progress = actionTimer / 30; // 30 frames jump
            const height = baseAltitude + Math.sin(progress * Math.PI) * (petSize * 0.7);
            petY = height;
            container.style.bottom = `${petY}px`;
            drawFrame('jump', facingRight);

            if (actionTimer >= 30) {
                state = 'idle';
                petY = baseAltitude;
                container.style.bottom = `${petY}px`;
                actionTimer = 0;
            }
            updateBubblePosition();
            return;
        }

        if (state === 'playing') {
            actionTimer++;
            if (actionTimer % 15 === 0) {
                actionPhase = (actionPhase + 1) % 2;
                say(myPet.speech.play[actionPhase], 500);
            }
            drawFrame(actionPhase === 0 ? 'idle' : 'play', facingRight);

            if (actionTimer >= 90) { // 90 frames playing
                state = 'idle';
                actionTimer = 0;
            }
            return;
        }

        // Behavior logic influenced by petFreq
        if (Math.abs(petX - targetX) < 5 && Math.abs(petY - targetY) < 5) {
            state = 'idle';
            petY = baseAltitude;
            sleepTimer++;

            if (sleepTimer > 300 / freqMod) { // High freq = falls asleep faster or roaming faster
                state = 'sleeping';
                // Move down to ground if sleeping while flying
                if (myPet.isFlying) petY = baseAltitude;

                drawFrame('sleep', facingRight);
                say(myPet.speech.sleep, 4000);
                sleepTimer = 0;
                return;
            }

            if (Math.random() < 0.02 * freqMod) {
                targetX = Math.random() * (window.innerWidth - 100) + 50;
                if (myPet.isFlying) {
                    targetY = baseAltitude + (Math.random() * 80 - 40); // vary altitude
                }
                sleepTimer = 0;
            } else if (Math.random() < 0.005 * freqMod) {
                say(myPet.thoughts[Math.floor(Math.random() * myPet.thoughts.length)], 3000);
                sleepTimer = 0;
            } else if (Math.random() < 0.003 * freqMod) {
                state = 'jumping';
                actionTimer = 0;
                say(myPet.speech.jump, 1500);
                sleepTimer = 0;
            } else if (Math.random() < 0.003 * freqMod) {
                state = 'playing';
                actionTimer = 0;
                actionPhase = 0;
                sleepTimer = 0;
            }
        } else {
            state = 'walking';
            sleepTimer = 0;
            let currentSpeed = 0.8 * (0.8 + freqMod * 0.2); // Freq slightly impacts walking speed

            if (petX < targetX) {
                petX += currentSpeed;
                facingRight = true;
            } else {
                petX -= currentSpeed;
                facingRight = false;
            }

            if (myPet.isFlying) {
                if (petY < targetY) petY += currentSpeed * 0.5;
                if (petY > targetY) petY -= currentSpeed * 0.5;
            }

            walkTimer++;
            if (walkTimer > 8) {
                walkTimer = 0;
                walkPhase = (walkPhase + 1) % 2;
            }
        }

        container.style.left = petX + 'px';
        container.style.bottom = petY + 'px';

        if (state === 'idle') {
            drawFrame('idle', facingRight);
        } else if (state === 'walking') {
            drawFrame(walkPhase === 0 ? 'walk1' : 'walk2', facingRight);
        }
    }

    setInterval(() => {
        updatePet();
        updateBubblePosition();
    }, 1000 / 60);

    drawFrame('idle', true);

    container.addEventListener('click', (e) => {
        if (state === 'sleeping') {
            state = 'idle';
            say(myPet.speech.wake, 2500);
            drawFrame('idle', facingRight);
            sleepTimer = 0;
            return;
        }

        state = 'sitting';
        drawFrame('sit', facingRight);
        say(myPet.speech.pet, 2500);
        sleepTimer = 0;

        heart.style.transition = 'none';
        heart.style.opacity = '1';
        heart.style.left = e.clientX + 'px';
        heart.style.bottom = (petY + petSize - 10) + 'px';
        heart.style.transform = 'translate(-50%, -50%) scale(0.5)';

        void heart.offsetWidth; // reflow

        heart.style.transition = 'all 1.5s ease-out';
        heart.style.bottom = (petY + petSize + 80) + 'px';
        heart.style.opacity = '0';
        heart.style.transform = 'translate(-50%, -50%) scale(1.5)';

        setTimeout(() => {
            if (state === 'sitting') state = 'idle';
        }, 2000);
    });

    let mouseTimeout;
    window.addEventListener('mousemove', (e) => {
        if (window.innerHeight - e.clientY < petSize + 50) {
            clearTimeout(mouseTimeout);
            mouseTimeout = setTimeout(() => {
                if (state !== 'sitting' && state !== 'sleeping' && Math.random() > (1.1 - freqMod / 2)) { // freq increases following chance
                    targetX = e.clientX;
                    if (myPet.isFlying) {
                        targetY = window.innerHeight - e.clientY - 30;
                        if (targetY < 50) targetY = 50;
                    }
                }
            }, 300);
        }
    });

    window.addEventListener('resize', () => {
        if (petX > window.innerWidth) {
            petX = window.innerWidth - petSize;
            targetX = petX;
        }
    });
}
