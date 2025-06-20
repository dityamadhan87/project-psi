const { createMachine, assign, interpret } = XState;

// XState Machine
const meowlifeMachine = createMachine({
    id: 'meowlife',
    initial: 'idle',
    context: {
        energy: 50,
        energyAwal: 0, // <--- untuk menyimpan nilai awal sebelum tidur
        satiety: 50,
        cleanliness: 50,
        mood: 0,
        lv: 1,
        xp: 0,
        money: 5
    },
    states: {
        idle: {
            after: {
                5000: {
                    actions: [
                        () => {
                            document.getElementById('cat-poop').classList.remove('hidden');
                        }
                    ]
                }
            },
            always: [
                {
                    cond: (context) => context.xp >= 1000,
                    target: 'celebrate',
                    actions:[
                        assign({
                            lv: (context) => context.lv + 1,
                        })
                    ]
                },
                {
                    cond: (context) => context.mood >= 100,
                    target: 'reward',
                    actions: [
                        assign({
                            mood: (context) => Math.max(0, context.mood - 100),
                        })
                    ]
                },
                {
                    cond: (context) => context.energy <= 0,
                    target: 'sleeping'
                }
            ],
            on: {
                MEOW: {
                    target: 'meowing'
                },
                SLEEP: {
                    target: 'sleeping'
                },
                EAT_WHISKAS: {
                    target: 'eating',
                    cond: (context) => context.money >= 5,
                    actions: [
                        assign({
                            xp: (context) => context.xp + 150,
                            satiety: (context) => Math.min(100, context.satiety + 30),
                            money: (context) => Math.max(0, context.money - 5),
                        })
                    ],
                },
                EAT_FISH: {
                    target: 'eating',
                    cond: (context) => context.money >= 8,
                    actions: [
                        assign({
                            xp: (context) => context.xp + 200,
                            satiety: (context) => Math.min(100, context.satiety + 40),
                            money: (context) => Math.max(0, context.money - 8),
                        })
                    ],
                },
                BATH: {
                    target: 'bathing',
                },
                CLEAN_POOP: {
                    target: 'idle',
                    actions: [
                        assign({
                            money: (context) => context.money + 3,
                            cleanliness: (context) => Math.max(0, context.cleanliness - 10),
                            mood: (context) => Math.min(100, context.mood + 5),
                            satiety: (context) => Math.max(0, context.satiety - 10),
                            energy: (context) => Math.max(0, context.energy - 10),
                            xp: (context) => context.xp + 150
                        }),
                        () => {
                            document.getElementById('cat-poop').classList.add('hidden');
                        }
                    ]
                },
            }
        },
        meowing: {
            after: {
                2000: {
                    target: 'idle',
                    actions: [
                        assign({
                            xp: (context) => context.xp + 100,
                            energy: (context) => Math.max(0, context.energy - 7),
                            satiety: (context) => Math.max(0, context.satiety - 10),
                            mood: (context) => Math.min(100, context.mood + 10)
                        })
                    ]
                }
            }
        },
        eating: {
            after: {
                6000: [
                    {
                    target: "idle",
                    actions: [
                        assign({
                            cleanliness: (context) => Math.max(0, context.cleanliness - 20),
                            mood: (context) => Math.min(100, context.mood + 10)
                        })
                    ],
                    },
                ],
            },
        },
        sleeping: {
            entry: assign({
                energyAwal: (ctx) => ctx.energy
            }),
            invoke: {
                id: 'sleepingInterval',
                src: () => (callback) => {
                    const interval = setInterval(() => {
                        callback('TICK');
                    }, 1000);
                    return () => clearInterval(interval);
                }
            },
            always: [
                {
                    cond: (ctx) => ctx.energy >= 100,
                    target: 'idle',
                    actions: assign({
                        xp: (ctx) => ctx.xp + 200
                    })
                }
            ],
            on: {
                TICK: {
                    actions: assign({
                        energy: (ctx) => Math.min(100, ctx.energy + 5),
                        mood: (ctx) => Math.min(100, ctx.mood + 2),
                        satiety: (ctx) => Math.max(0, ctx.satiety - 2),
                        cleanliness: (ctx) => Math.max(0, ctx.cleanliness - 4)
                    })
                },
                WAKE_UP: {
                    target: 'idle',
                    actions: assign({
                        xp: (ctx) => {
                            const kenaikan = ctx.energy - ctx.energyAwal;
                            return ctx.xp + Math.floor(kenaikan * 1.5);
                        }
                    })
                }
            },
        },   
        bathing: {
            after: {
                7000: {
                    target: 'idle',
                    actions: [
                        assign({
                            xp: (context) => context.xp + 250,
                            energy: (context) => Math.max(0, context.energy - 10),
                            cleanliness: (context) => Math.min(100, context.cleanliness = 100),
                            satiety: (context) => Math.max(0, context.satiety - 7),
                        })
                    ]
                }
            }
        },
        reward: {
            after: {
                8000: {
                    target: 'idle',
                    actions: [
                        assign({
                            money: (context) => context.money + 20,
                            xp: (context) => context.xp + 200,
                        })
                    ]
                }
            }
        },
        celebrate: {
            after: {
                8000: {
                    target: 'idle',
                    actions: [
                        assign({
                            money: (context) => context.money + 30,
                            xp: (_) => 0,
                        })
                    ]
                }
            }
        },
    }
});

// Initialize service
const service = interpret(meowlifeMachine);

// UI Elements
const elemens = {
        cat:        document.getElementById('cat'),
        loveLove:   document.getElementById('love1'),
        soundBtn:   document.getElementById('sound-btn'),
        sleepBtn:   document.getElementById('sleep-btn'),
        bathBtn:    document.getElementById('bath-btn'),
        feedBtn:    document.getElementById('feed-btn'),
        dropdown:   document.getElementById('dropdown-feed-options'),
        celebrate:  document.getElementById('celebrate'),
        wakeUp:     document.getElementById('wake-up')
}

// Sleep audio
let sleepAudio = null;

// Helper functions
function getBarWidth(value) {
    return Math.max(0, Math.min(100, value)) + '%';
}

function getXPForCurrentLevel(xp) {
    return xp % 1000;
}

function getXPForNextLevel() {
    return 1000;
}

function disableButton(){
    elemens.soundBtn.disabled = true;
    elemens.soundBtn.classList.add('opacity-50', 'cursor-not-allowed');
    elemens.sleepBtn.disabled = true;
    elemens.sleepBtn.classList.add('opacity-50', 'cursor-not-allowed');
    elemens.bathBtn.disabled = true;
    elemens.bathBtn.classList.add('opacity-50', 'cursor-not-allowed');
    elemens.feedBtn.disabled = true;
    elemens.feedBtn.classList.add('opacity-50', 'cursor-not-allowed');
}

// Update UI function
function updateUI(state) {
    const context = state.context;

    // Update stat values
    document.getElementById('energy-value').textContent = context.energy;
    document.getElementById('satiety-value').textContent = context.satiety;
    document.getElementById('cleanliness-value').textContent = context.cleanliness;
    document.getElementById('mood-value').textContent = context.mood;
    document.getElementById('money-value').textContent = '$' + context.money;

    // Update progress bars
    document.getElementById('energy-bar').style.width = getBarWidth(context.energy);
    document.getElementById('satiety-bar').style.width = getBarWidth(context.satiety);
    document.getElementById('cleanliness-bar').style.width = getBarWidth(context.cleanliness);
    document.getElementById('mood-bar').style.width = getBarWidth(context.mood);

    // Update experience
    const level = context.lv;
    const currentXP = getXPForCurrentLevel(context.xp);
    const nextLevelXP = getXPForNextLevel();

    document.getElementById('level-value').textContent = 'Level ' + level;
    document.getElementById('current-xp').textContent = currentXP + ' XP';
    document.getElementById('next-level-xp').textContent = nextLevelXP + ' XP';
    document.getElementById('xp-bar').style.width = getBarWidth((currentXP / nextLevelXP) * 100);

    if (state.matches('meowing')) {
        elemens.cat.innerHTML = `<img src="./cat-meowing.png" alt="Cat Meowing" />`;
        new Audio('./cat-meow.mp3').play();
        disableButton();
    } 
    else if (state.matches('sleeping')) {
        elemens.cat.innerHTML = `<img src="./cat-sleep.png" alt="Cat Sleeping" />`;
        elemens.wakeUp.classList.remove('hidden');
        disableButton();
        if (!sleepAudio) {
            sleepAudio = new Audio('./cat-sleping.wav');
            sleepAudio.loop = true;
            sleepAudio.play();
        }
    }
    
    else if (state.matches('eating')) {
        elemens.cat.innerHTML = `<img src="./cat-eating.png" alt="Cat Eating" />`;
        new Audio('./cat-eating.mp3').play();
        disableButton();
    }
    else if (state.matches('bathing')) {
        elemens.cat.innerHTML = `<img src="./cat-bathing.png" alt="Cat Bathing" />`;
        new Audio('./cat-bath-shower.wav').play();
        disableButton();
    }
    else if (state.matches('reward')) {
        elemens.cat.innerHTML = `<img src="./cat-happy.gif" alt="Cat Happy" />`;
        new Audio('./cat-happy.mp3').play();
        elemens.loveLove.classList.remove('hidden');
        disableButton();
    }
    else if (state.matches('celebrate')) {
        elemens.cat.innerHTML = `<img src="./cat-celebration.gif" alt="cat Celebrate" />`;
        new Audio('./celebrate.mp3').play();
        elemens.celebrate.classList.remove('hidden');
        disableButton();
    }
    else {
        if (sleepAudio) {
            sleepAudio.pause();
            sleepAudio.currentTime = 0;
            sleepAudio = null;
        }
        elemens.cat.innerHTML = `<img src="./cat.png" alt="Cat" />`;
        elemens.loveLove.classList.add('hidden');
        elemens.celebrate.classList.add('hidden');
        elemens.wakeUp.classList.add('hidden');
        elemens.soundBtn.disabled = false;
        elemens.sleepBtn.disabled = false;
        elemens.bathBtn.disabled = false;
        elemens.feedBtn.disabled = false;
        elemens.soundBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        elemens.sleepBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        elemens.bathBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        elemens.feedBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

// Event listeners

// Toggle dropdown saat tombol diklik
elemens.feedBtn.addEventListener('click', () => {
    elemens.dropdown.classList.toggle('hidden');
});
// Sembunyikan dropdown saat klik di luar area dropdown
document.addEventListener('click', (event) => {
    if (!elemens.feedBtn.contains(event.target) && !elemens.dropdown.contains(event.target)) {
        elemens.dropdown.classList.add('hidden');
    }
});

document.getElementById('sound-btn').addEventListener('click', () => {
    service.send({ type: 'MEOW' });
});

const msg = document.getElementById('sleep-msg');
document.getElementById('sleep-btn').addEventListener('click', () => {
    const { energy } = service.getSnapshot().context;
    if (energy >= 100) {
        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 3000);
    } else {
        service.send('SLEEP');
        msg.classList.add('hidden'); // sembunyikan pesan jika sebelumnya muncul
    }
});
document.getElementById('feed-whiskas').addEventListener('click', () => {
    service.send({ type: 'EAT_WHISKAS' });
});
document.getElementById('feed-fish').addEventListener('click', () => {
    service.send({ type: 'EAT_FISH' });
});
document.getElementById('bath-btn').addEventListener('click', () => {
    service.send({ type: 'BATH' });
});
document.getElementById('cat-poop').addEventListener('click', () => {
    service.send('CLEAN_POOP');
});
document.getElementById('wake-up').addEventListener('click', () => {
    service.send('WAKE_UP');
});

// Subscribe to state changes
service.onTransition((state) => {
    updateUI(state);
});

// Start the service
service.start();