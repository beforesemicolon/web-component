const renderGoogleAnalyticsScript = () => `
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-MMBMGFEBY6"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-MMBMGFEBY6');
</script>`

export default {
    meta: {
        siteName: 'WebComponent',
        title: 'WebComponent by Before Semicolon',
        description:
            'Build reactive Web Components enhanced with state, props, scoped styles, lifecycles, and form integration — powered by Markup.',
        image: '/assets/web-component-banner.jpg',
    },
    site: {
        name: 'WebComponent',
        packageName: '@beforesemicolon/web-component',
        repositoryUrl: 'https://github.com/beforesemicolon/web-component',
        repositoryLabel: 'WebComponent GitHub repository',
        docsEditUrl:
            'https://github.com/beforesemicolon/web-component/tree/main/docs',
        footerDescription:
            'Reactive Web Components enhanced with state, props, scoped styles, lifecycles, and form integration.',
        footerGroups: [
            {
                title: 'Learning Resources',
                links: [{ label: 'Documentation', href: '/documentation' }],
            },
            {
                title: 'About Before Semicolon',
                links: [
                    {
                        label: 'Open Source',
                        href: 'https://github.com/beforesemicolon',
                    },
                    {
                        label: 'Website',
                        href: 'https://beforesemicolon.com/',
                    },
                    {
                        label: 'Blog',
                        href: 'https://medium.com/before-semicolon',
                    },
                    {
                        label: 'YouTube Channel',
                        href: 'https://www.youtube.com/channel/UCrU33aw1k9BqTIq2yKXrmBw',
                    },
                ],
            },
        ],
        socialLinks: [
            {
                name: 'Medium blog',
                href: 'https://medium.com/before-semicolon',
                icon: '/assets/medium2.svg',
            },
            {
                name: 'Facebook',
                href: 'https://www.facebook.com/beforesemicolon/',
                icon: '/assets/facebook.svg',
            },
            {
                name: 'Instagram',
                href: 'https://www.instagram.com/before_semicolon_/',
                icon: '/assets/instagram.svg',
            },
            {
                name: 'Reddit',
                href: 'https://www.reddit.com/r/beforesemicolon/',
                icon: '/assets/reddit.svg',
            },
            {
                name: 'Twitter',
                href: 'https://twitter.com/BeforeSemicolon',
                icon: '/assets/twitter.svg',
            },
            {
                name: 'YouTube',
                href: 'https://www.youtube.com/channel/UCrU33aw1k9BqTIq2yKXrmBw',
                icon: '/assets/youtube.svg',
            },
        ],
        copyright: `Copyright &copy; ${new Date().getFullYear()} Before Semicolon. All rights reserved.`,
    },
    headScripts: {
        analytics: renderGoogleAnalyticsScript,
    },
    theme: {
        light: {
            '--background': 'oklch(0.98 0.012 250)',
            '--foreground': 'oklch(0.18 0.025 250)',
            '--heading': 'var(--foreground)',
            '--card': 'oklch(1 0 0)',
            '--primary': 'oklch(0.58 0.17 240)',
            '--primary-glow': 'oklch(0.64 0.18 235)',
            '--primary-foreground': 'oklch(0.98 0.012 250)',
            '--secondary': 'oklch(0.93 0.02 250)',
            '--muted': 'oklch(0.94 0.018 250)',
            '--muted-foreground': 'oklch(0.42 0.035 250)',
            '--accent': 'oklch(0.55 0.14 225)',
            '--border': 'oklch(0.86 0.028 250)',
            '--ring': 'oklch(0.58 0.17 240)',
            '--surface': 'color-mix(in oklch, var(--card) 86%, transparent)',
            '--surface-muted':
                'color-mix(in oklch, var(--muted) 78%, transparent)',
            '--surface-hover': 'oklch(0.94 0.03 240)',
            '--surface-border':
                'color-mix(in oklch, var(--border) 78%, transparent)',
            '--header-bg':
                'color-mix(in oklch, var(--background) 72%, transparent)',
            '--footer-bg':
                'color-mix(in oklch, var(--background) 96%, var(--foreground) 4%)',
            '--grid-line':
                'color-mix(in oklch, var(--foreground) 7%, transparent)',
            '--gradient-hero':
                'radial-gradient(ellipse at top, oklch(0.7 0.12 240 / 0.26), transparent 60%)',
            '--gradient-primary':
                'linear-gradient(135deg, var(--primary), var(--primary-glow))',
            '--gradient-text':
                'linear-gradient(135deg, oklch(0.18 0.025 250), oklch(0.36 0.08 240))',
            '--gradient-border':
                'linear-gradient(135deg, oklch(0.58 0.17 240 / 0.45), oklch(0.6 0.14 200 / 0.25))',
            '--shadow-glow': '0 0 60px -15px oklch(0.58 0.17 240 / 0.35)',
            '--shadow-card':
                '0 1px 0 0 oklch(1 0 0 / 0.75) inset, 0 20px 40px -20px oklch(0.18 0.025 250 / 0.16)',
        },
        dark: {
            '--background': 'oklch(0.12 0.015 250)',
            '--foreground': 'oklch(0.96 0.008 250)',
            '--heading': 'var(--foreground)',
            '--card': 'oklch(0.18 0.02 250)',
            '--primary': 'oklch(0.68 0.18 240)',
            '--primary-glow': 'oklch(0.74 0.19 235)',
            '--primary-foreground': 'oklch(0.12 0.02 250)',
            '--secondary': 'oklch(0.22 0.025 250)',
            '--muted': 'oklch(0.2 0.02 250)',
            '--muted-foreground': 'oklch(0.7 0.035 250)',
            '--accent': 'oklch(0.68 0.18 240)',
            '--border': 'oklch(0.28 0.035 250)',
            '--ring': 'oklch(0.68 0.18 240)',
            '--surface': 'color-mix(in oklch, var(--card) 46%, transparent)',
            '--surface-muted':
                'color-mix(in oklch, var(--card) 62%, transparent)',
            '--surface-hover': 'oklch(0.24 0.04 240)',
            '--surface-border':
                'color-mix(in oklch, var(--border) 70%, transparent)',
            '--header-bg':
                'color-mix(in oklch, var(--background) 60%, transparent)',
            '--footer-bg':
                'color-mix(in oklch, var(--background) 88%, black 12%)',
            '--grid-line':
                'color-mix(in oklch, var(--foreground) 5%, transparent)',
            '--gradient-hero':
                'radial-gradient(ellipse at top, oklch(0.28 0.08 240 / 0.35), transparent 60%)',
            '--gradient-primary':
                'linear-gradient(135deg, var(--primary), var(--primary-glow))',
            '--gradient-text':
                'linear-gradient(135deg, oklch(0.98 0.005 250), oklch(0.78 0.08 240))',
            '--gradient-border':
                'linear-gradient(135deg, oklch(0.68 0.18 240 / 0.5), oklch(0.7 0.16 200 / 0.3))',
            '--shadow-glow': '0 0 60px -15px oklch(0.68 0.18 240 / 0.5)',
        },
    },
}
