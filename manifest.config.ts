import {defineManifest} from '@crxjs/vite-plugin'

const manifest = defineManifest({
    manifest_version: 3,
    name: 'gmeet-time',
    version: '0.1.0',
    description:
        'Track Google Meet time automatically and review a clean daily meeting timeline.',
    homepage_url: 'https://github.com/HichemTab-tech/gmeet-time',
    permissions: ['storage', 'alarms'],
    host_permissions: ['https://meet.google.com/*'],
    background: {
        service_worker: 'src/background/main.ts',
        type: 'module',
    },
    action: {
        default_title: 'gmeet-time',
        default_popup: 'index.html',
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