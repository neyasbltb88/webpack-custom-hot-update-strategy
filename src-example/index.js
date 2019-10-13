import render from './render';
import a from './a.js';
import b from './b.js';
import c from './c.js';

let modules = {
    './a.js': a,
    './b.js': b,
    './c.js': c
};

for (const name in modules) {
    render(`[HMR] - ${modules[name]()}`);
}

document.body.appendChild(document.createElement('hr'));

if (module.hot) {
    module.hot.accept(['./a.js', './b.js', './c.js'], names => {
        names.forEach(name => {
            render(`[HMR] - ${modules[name]()}`);
            document.body.appendChild(document.createElement('hr'));
        });
    });

    module.hot.accept(err => console.log(err));
}
