const { createMachine, assign, interpret } = XState;
const { fromEvent, merge } = rxjs;
const { filter, tap, map } = rxjs.operators;

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

const service = interpret(meowlifeMachine).start();

const el = {
    cat: document.getElementById('cat'),
    poop: document.getElementById('cat-poop'),
    love: document.getElementById('love1'),
    dropdown: document.getElementById('dropdown-feed-options'),
    celebrate: document.getElementById('celebrate'),
    wake: document.getElementById('wake-up'),
    msg: document.getElementById('sleep-msg'),
    btns: {
        sound: document.getElementById('sound-btn'),
        sleep: document.getElementById('sleep-btn'),
        bath: document.getElementById('bath-btn'),
        feed: document.getElementById('feed-btn'),
        whiskas: document.getElementById('feed-whiskas'),
        fish: document.getElementById('feed-fish')
    }
};

let sleepAudio = null;

function getBarWidth(val) { return Math.max(0, Math.min(100, val)) + '%'; }
function getXP(ctx) { return ctx.xp % 1000; }

function updateUI(state) {
    const ctx = state.context;

    ['energy', 'satiety', 'cleanliness', 'mood'].forEach(key => {
        document.getElementById(`${key}-value`).textContent = ctx[key];
        document.getElementById(`${key}-bar`).style.width = getBarWidth(ctx[key]);
    });

    document.getElementById('money-value').textContent = `$${ctx.money}`;
    document.getElementById('level-value').textContent = `Level ${ctx.lv}`;
    document.getElementById('current-xp').textContent = `${getXP(ctx)} XP`;
    document.getElementById('next-level-xp').textContent = '1000 XP';
    document.getElementById('xp-bar').style.width = getBarWidth((getXP(ctx) / 1000) * 100);

    const stateToImage = {
        meowing: ['cat-meowing.png', './cat-meow.mp3'],
        sleeping: ['cat-sleep.png', './cat-sleping.wav'],
        eating: ['cat-eating.png', './cat-eating.mp3'],
        bathing: ['cat-bathing.png', './cat-bath-shower.wav'],
        reward: ['cat-happy.gif', './cat-happy.mp3'],
        celebrate: ['cat-celebration.gif', './celebrate.mp3']
    };

    Object.entries(stateToImage).forEach(([stateKey, [img, audio]]) => {
        if (state.matches(stateKey)) {
            el.cat.innerHTML = `<img src="${img}" alt="${stateKey}" />`;
            const sound = new Audio(audio);
            if (stateKey === 'sleeping') {
                if (!sleepAudio) {
                    sleepAudio = sound;
                    sound.loop = true;
                    sound.play();
                }
                el.wake.classList.remove('hidden');
            } else {
                sound.play();
                disableButtons();
            }
        }
    });

    if (state.matches('idle')) {
        if (sleepAudio) {
            sleepAudio.pause();
            sleepAudio = null;
        }
        el.cat.innerHTML = `<img src="./cat.png" alt="Cat" />`;
        el.love.classList.add('hidden');
        el.celebrate.classList.add('hidden');
        el.wake.classList.add('hidden');
        enableButtons();
    }

    if (state.matches('reward')) el.love.classList.remove('hidden');
    if (state.matches('celebrate')) el.celebrate.classList.remove('hidden');
}

function disableButtons() {
    Object.values(el.btns).forEach(btn => {
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
    });
}

function enableButtons() {
    Object.values(el.btns).forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
    });
}

merge(
    fromEvent(el.btns.sound, 'click').pipe(map(() => 'MEOW')),
    fromEvent(el.btns.sleep, 'click').pipe(map(() => 'SLEEP')),
    fromEvent(el.btns.whiskas, 'click').pipe(map(() => 'EAT_WHISKAS')),
    fromEvent(el.btns.fish, 'click').pipe(map(() => 'EAT_FISH')),
    fromEvent(el.btns.bath, 'click').pipe(map(() => 'BATH')),
    fromEvent(el.poop, 'click').pipe(map(() => 'CLEAN_POOP')),
    fromEvent(el.wake, 'click').pipe(map(() => 'WAKE_UP'))
).subscribe(event => {
    const { energy } = service.getSnapshot().context;
    if (event === 'SLEEP' && energy >= 100) {
        el.msg.classList.remove('hidden');
        setTimeout(() => el.msg.classList.add('hidden'), 3000);
    } else {
        el.msg.classList.add('hidden');
        service.send(event);
    }
});

fromEvent(el.btns.feed, 'click').subscribe(() => {
    el.dropdown.classList.toggle('hidden');
});
fromEvent(document, 'click').pipe(
    filter(e => !el.btns.feed.contains(e.target) && !el.dropdown.contains(e.target))
).subscribe(() => el.dropdown.classList.add('hidden'));

service.onTransition(updateUI);