import Link from "next/link";
import { BarChart3, CalendarDays, ClipboardList, Map, Package, Smartphone, WifiOff } from "lucide-react";

const FEATURES = [
  { icon: ClipboardList, title: "Ordens de serviço com ID", text: "Cada OS tem um código único (OS-001012) e formulário completo: equipe, tarefas, segurança, materiais e custos." },
  { icon: Map, title: "Mapa da fábrica", text: "Veja onde está cada injetora, seladora e embaladora, quem opera e quem precisa de manutenção." },
  { icon: CalendarDays, title: "Calendário de manutenção", text: "Tarefas realizadas, pendentes e atrasadas em um calendário. Gere a OS direto do plano." },
  { icon: BarChart3, title: "Estatísticas de OS", text: "“Em agosto tivemos 200 OS criadas e 190 concluídas”: gráficos por mês e taxa de conclusão." },
  { icon: Package, title: "Estoque de peças", text: "Peças abaixo do mínimo ficam em destaque, com requisições e transferências." },
  { icon: Smartphone, title: "Celular e offline", text: "Instale na tela inicial do iPhone ou Android e use mesmo sem internet." },
];

export default function Landing() {
  return (
    <div>
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <img src="/logo.svg" alt="Guiguel" className="h-10" />
        <Link href="/login" className="inline-flex h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground md:h-9">Entrar</Link>
      </header>
      <section className="mx-auto max-w-5xl px-5 pb-10 pt-8 md:pt-16">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">Gestão de manutenção</p>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">Toda a manutenção da fábrica em um só lugar.</h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">Feito para a rotina da Guiguel: injetoras, seladoras, tampografia e embalagem das tampas de Marinex, Nutella, Starbucks e cremes.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/login" className="inline-flex h-12 items-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground">Entrar no sistema</Link>
          <a href="#video" className="inline-flex h-12 items-center rounded-md border border-border px-6 text-sm font-semibold">Ver apresentação</a>
        </div>
      </section>
      <section id="video" className="mx-auto max-w-5xl px-5 py-6">
        <video controls preload="metadata" className="w-full rounded-md border border-border bg-black" src="/guiguel-apresentacao.mp4" />
      </section>
      <section className="mx-auto grid max-w-5xl gap-3 px-5 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-md border border-border bg-card p-5">
            <f.icon className="mb-3 h-5 w-5 text-primary" />
            <h2 className="font-semibold">{f.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </section>
      <section className="mx-auto max-w-5xl px-5 pb-16">
        <div className="rounded-md border border-border bg-card p-6">
          <div className="mb-2 flex items-center gap-2 font-semibold"><WifiOff className="h-4 w-4 text-primary" />Instale no celular</div>
          <p className="text-sm text-muted-foreground"><b className="text-foreground">iPhone (Safari):</b> Compartilhar, depois “Adicionar à Tela de Início”. <b className="text-foreground">Android (Chrome):</b> menu ⋮, depois “Instalar app”. Abra uma vez com internet; depois funciona offline.</p>
        </div>
      </section>
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">Guiguel Gestão de Manutenção</footer>
    </div>
  );
}
