import {defineManifest} from '@crxjs/vite-plugin'
import pkg from './package.json'

const version = pkg.version;

const manifest = defineManifest({
    manifest_version: 3,
    name: 'gmeet-time',
    version: version,
    description:
        'Track Google Meet time automatically and review a clean daily meeting timeline.',
    homepage_url: 'https://github.com/HichemTab-tech/gmeet-time',
    icons: {
        16: 'icons/icon-16.png',
        32: 'icons/icon-32.png',
        48: 'icons/icon-48.png',
        128: 'icons/icon-128.png',
    },
    permissions: ['storage', 'alarms'],
    host_permissions: ['https://meet.google.com/*'],
    background: {
        service_worker: 'src/background/main.ts',
        type: 'module',
    },
    action: {
        default_title: 'gmeet-time',
        default_popup: 'index.html',
        default_icon: {
            16: 'icons/icon-16.png',
            32: 'icons/icon-32.png',
            48: 'icons/icon-48.png',
        },
    },
    content_scripts: [
        {
            matches: ['https://meet.google.com/*'],
            js: ['src/content/meet-observer.ts'],
            run_at: 'document_idle',
        },
    ],
})

export default manifest