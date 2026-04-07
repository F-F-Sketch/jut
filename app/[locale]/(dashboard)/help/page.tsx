import Link from 'next/link'
import { MessageSquare, Book, Zap, AtSign, Settings, ExternalLink } from 'lucide-react'

interface PageProps { params: { locale: string } }

export default function HelpPage({ params }: PageProps) {
  const { locale } = params
  const isES = locale === 'es'

  const sections = [
    {
      icon: Zap,
      title: isES ? 'Empezar rápido' : 'Quick Start',
      desc: isES ? 'Configura tu primera automatización en 5 minutos' : 'Set up your first automation in 5 minutes',
      steps: isES
        ? ['Ve a Configuración y completa tu perfil de negocio', 'Conecta tu cuenta de Instagram', 'Crea un trigger de comentarios en Social Triggers', 'Activa la automatización y pruébala']
        : ['Go to Business Config and complete your business profile', 'Connect your Instagram account in Settings', 'Create a comment trigger in Social Triggers', 'Activate the automation and test it'],
    },
    {
      icon: AtSign,
      title: isES ? 'Conectar Instagram' : 'Connect Instagram',
      desc: isES ? 'Pasos para conectar tu cuenta de Instagram Business' : 'Steps to connect your Instagram Business account',
      steps: isES
        ? ['Tu cuenta debe ser Instagram Business o Creator', 'Ve a Ajustes → Integraciones', 'Haz clic en "Conectar Instagram"', 'Autoriza la app en Facebook/Meta', 'Configura los permisos requeridos']
        : ['Your account must be Instagram Business or Creator', 'Go to Settings → Integrations', 'Click "Connect Instagram"', 'Authorize the app on Facebook/Meta', 'Grant required permissions'],
    },
    {
      icon: MessageSquare,
      title: isES ? 'Configurar la IA' : 'Configure AI',
      desc: isES ? 'Personaliza cómo responde tu agente de IA' : 'Customize how your AI agent responds',
      steps: isES
        ? ['Ve a Configuración del Negocio', 'Completa la información de tu empresa', 'Define el tono de comunicación', 'Agrega FAQs y ofertas', 'La IA usará esta info en todas las conversaciones']
        : ['Go to Business Configuration', 'Fill in your company information', 'Define the communication tone', 'Add FAQs and offers', 'The AI will use this info in all conversations'],
    },
  ]

  const faqs = isES ? [
    { q: '¿Necesito una cuenta de Instagram Business?', a: 'Sí, JUT requiere una cuenta de Instagram Business o Creator para acceder a la API de comentarios y DMs.' },
    { q: '¿Puedo usar JUT en español?', a: 'Sí, JUT está completamente disponible en español colombiano. Puedes cambiar el idioma en la barra superior o en Ajustes.' },
    { q: '¿Cuánto tiempo tarda en responder el bot?', a: 'Menos de 3 segundos. Las respuestas de IA son instantáneas una vez que el webhook de Instagram entrega el comentario.' },
    { q: '¿Puedo probar JUT antes de pagar?', a: 'Sí, el plan gratuito incluye 3 automatizaciones y 100 leads/mes sin tarjeta de crédito.' },
    { q: '¿Funciona en Colombia y Estados Unidos?', a: 'Sí, JUT está disponible en ambos mercados con soporte para COP y USD.' },
  ] : [
    { q: 'Do I need an Instagram Business account?', a: 'Yes, JUT requires an Instagram Business or Creator account to access the comments and DMs API.' },
    { q: 'How fast does the bot respond?', a: 'Under 3 seconds. AI responses are instant once Instagram delivers the comment via webhook.' },
    { q: 'Can I test JUT before paying?', a: 'Yes, the free plan includes 3 automations and 100 leads/month with no credit card required.' },
    { q: 'Does JUT work in Colombia and the US?', a: 'Yes, JUT is available in both markets with support for COP and USD currencies.' },
    { q: 'What languages does the AI support?', a: 'The AI can respond in any language. Set your primary language in Business Configuration.' },
  ]

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-3xl mb-2" style={{ color: 'var(--text)' }}>
          {isES ? 'Ayuda y Soporte' : 'Help & Support'}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-3)', fontWeight: 300 }}>
          {isES ? 'Todo lo que necesitas para sacar el máximo provecho de JUT' : 'Everything you need to get the most out of JUT'}
        </p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Book, label: isES ? 'Documentación' : 'Documentation', href: 'https://docs.jut.ai' },
          { icon: MessageSquare, label: isES ? 'Chat de soporte' : 'Support Chat', href: `/${locale}/conversations` },
          { icon: Settings, label: isES ? 'Configuración' : 'Settings', href: `/${locale}/settings` },
          { icon: Zap, label: isES ? 'Nueva automatización' : 'New Automation', href: `/${locale}/automations/new` },
        ].map(link => (
          <Link
            key={link.label}
            href={link.href}
            className="card rounded-xl p-4 flex flex-col items-center gap-2 text-center transition-all hover:translate-y-[-2px]"
            style={{ borderColor: 'var(--border-2)' }}
          >
            <link.icon size={20} style={{ color: 'var(--pink)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>{link.label}</span>
          </Link>
        ))}
      </div>

      {/* Getting started guides */}
      <div className="space-y-5">
        <h2 className="font-display font-bold text-xl" style={{ color: 'var(--text)' }}>
          {isES ? 'Guías de inicio' : 'Getting Started Guides'}
        </h2>
        <div className="grid gap-5">
          {sections.map(section => (
            <div key={section.title} className="card rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(237,25,102,0.1)', border: '1px solid rgba(237,25,102,0.2)' }}
                >
                  <section.icon size={18} style={{ color: 'var(--pink)' }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-base mb-1" style={{ color: 'var(--text)' }}>
                    {section.title}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-3)', fontWeight: 300 }}>
                    {section.desc}
                  </p>
                  <ol className="space-y-2">
                    {section.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                          style={{ background: 'var(--pink)', fontSize: 10 }}
                        >
                          {i + 1}
                        </span>
                        <span className="text-sm" style={{ color: 'var(--text-2)', fontWeight: 300 }}>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-5">
        <h2 className="font-display font-bold text-xl" style={{ color: 'var(--text)' }}>
          {isES ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'}
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="card rounded-2xl p-5">
              <h3 className="font-display font-bold text-sm mb-2" style={{ color: 'var(--text)' }}>{faq.q}</h3>
              <p className="text-sm" style={{ color: 'var(--text-3)', fontWeight: 300, lineHeight: 1.65 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact CTA */}
      <div
        className="rounded-2xl p-8 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(237,25,102,0.08), rgba(33,82,164,0.08))', border: '1px solid rgba(237,25,102,0.15)' }}
      >
        <h3 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--text)' }}>
          {isES ? '¿Necesitas ayuda adicional?' : 'Need additional help?'}
        </h3>
        <p className="text-sm mb-6" style={{ color: 'var(--text-3)', fontWeight: 300 }}>
          {isES
            ? 'Nuestro equipo de soporte está disponible de lunes a viernes, 9am–6pm (Colombia / ET).'
            : 'Our support team is available Monday–Friday, 9am–6pm Colombia / ET.'}
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a
            href="mailto:support@jut.ai"
            className="btn-primary flex items-center gap-2"
          >
            <MessageSquare size={14} />
            {isES ? 'Enviar mensaje' : 'Send a message'}
          </a>
          <a
            href="https://docs.jut.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center gap-2"
          >
            <ExternalLink size={14} />
            {isES ? 'Ver documentación' : 'View documentation'}
          </a>
        </div>
      </div>
    </div>
  )
}
