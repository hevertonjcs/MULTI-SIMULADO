/** @type {import('tailwindcss').Config} */
    module.exports = {
      darkMode: ["class"],
      content: [
        './pages/**/*.{js,jsx}',
        './components/**/*.{js,jsx}',
        './app/**/*.{js,jsx}',
        './src/**/*.{js,jsx}',
        './index.html',
      ],
      theme: {
        container: {
          center: true,
          padding: "2rem",
          screens: {
            "2xl": "1400px",
          },
        },
        extend: {
          colors: {
            border: "hsl(var(--border))",
            input: "hsl(var(--input))",
            ring: "hsl(var(--ring))",
            background: "hsl(var(--background))",
            foreground: "hsl(var(--foreground))",
            primary: {
              DEFAULT: "hsl(var(--primary))",
              foreground: "hsl(var(--primary-foreground))",
            },
            secondary: {
              DEFAULT: "hsl(var(--secondary))",
              foreground: "hsl(var(--secondary-foreground))",
            },
            destructive: {
              DEFAULT: "hsl(var(--destructive))",
              foreground: "hsl(var(--destructive-foreground))",
            },
            muted: {
              DEFAULT: "hsl(var(--muted))",
              foreground: "hsl(var(--muted-foreground))",
            },
            accent: {
              DEFAULT: "hsl(var(--accent))",
              foreground: "hsl(var(--accent-foreground))",
            },
            popover: {
              DEFAULT: "hsl(var(--popover))",
              foreground: "hsl(var(--popover-foreground))",
            },
            card: {
              DEFAULT: "hsl(var(--card))",
              foreground: "hsl(var(--card-foreground))",
            },
            "app-background": "var(--app-background)",
            "app-text": "var(--app-text)",
            "app-secondary": "var(--app-secondary)",
            "app-primary": "var(--app-primary)",
            "app-primary-dark": "var(--app-primary-dark)",
            "app-primary-hover": "rgba(0, 198, 150, 0.1)", 
            "app-primary-focus": "rgba(0, 198, 150, 0.2)",
            "app-primary-border": "rgba(0, 198, 150, 0.5)",
            "app-surface": "var(--app-surface)",
            "app-error": "var(--app-error)",
            "app-input-border": "var(--app-input-border)",
            "app-muted-foreground": "var(--app-muted-foreground)",
            "toast-success": "var(--toast-success)",
            "toast-error": "var(--toast-error)",
            "toast-info": "var(--toast-info)",
            "field-background": "var(--field-background)",
            "field-border": "var(--field-border)",
            "field-text": "var(--field-text)",
          },
          boxShadow: {
            'field-focus': '0 0 0 3px var(--field-focus-ring)',
          },
          borderRadius: {
            lg: "var(--radius)",
            md: "calc(var(--radius) - 2px)",
            sm: "calc(var(--radius) - 4px)",
          },
          keyframes: {
            "accordion-down": {
              from: { height: "0" },
              to: { height: "var(--radix-accordion-content-height)" },
            },
            "accordion-up": {
              from: { height: "var(--radix-accordion-content-height)" },
              to: { height: "0" },
            },
          },
          animation: {
            "accordion-down": "accordion-down 0.2s ease-out",
            "accordion-up": "accordion-up 0.2s ease-out",
          },
        },
      },
      plugins: [require("tailwindcss-animate")],
    }