import { AlertCircle, ArrowLeftRight, BarChart3, BookOpen, Boxes, CalendarClock, CalendarDays, ClipboardList, Factory, FileBarChart, FileText, Gauge, Layers, LayoutDashboard, ListChecks, Map, MapPin, Package, PauseCircle, ShieldCheck, Tag, Truck, Wrench, type LucideIcon } from "lucide-react";

export interface MenuItem { href: string; label: string; icon: LucideIcon; short?: string; main?: boolean }
export const MENU: { group: string; items: MenuItem[] }[] = [
  { group: "Operação", items: [
    { href: "/painel", label: "Painel", icon: LayoutDashboard, main: true },
    { href: "/mapa", label: "Mapa da fábrica", short: "Mapa", icon: Map, main: true },
    { href: "/os", label: "Ordem de Serviço", short: "OS", icon: ClipboardList, main: true },
    { href: "/pendencias", label: "Pendências", icon: AlertCircle },
    { href: "/paradas", label: "Paradas", icon: PauseCircle },
    { href: "/planos", label: "Planos de Manutenção", short: "Planos", icon: CalendarDays, main: true },
    { href: "/diario", label: "Diário de Manutenção", icon: BookOpen },
  ] },
  { group: "Equipamentos", items: [
    { href: "/equipamentos", label: "Equipamentos", icon: Factory },
    { href: "/cadastros/tags", label: "TAGs", icon: Tag },
    { href: "/cadastros/lis", label: "Locais de instalação (LIs)", icon: MapPin },
    { href: "/cadastros/locais", label: "Locais", icon: MapPin },
    { href: "/cadastros/regioes", label: "Regiões", icon: Layers },
  ] },
  { group: "Estoque", items: [
    { href: "/estoque", label: "Estoque de Peças", icon: Package },
    { href: "/cadastros/pecas", label: "Peças Sobressalentes", icon: Boxes },
    { href: "/cadastros/transferencias", label: "Transferência de Estoque", icon: ArrowLeftRight },
    { href: "/cadastros/fornecedores", label: "Fornecedores", icon: Truck },
    { href: "/cadastros/requisicoes", label: "Requisições de Materiais", icon: FileText },
  ] },
  { group: "Recursos", items: [
    { href: "/cadastros/ferramentas", label: "Ferramentas", icon: Wrench },
    { href: "/cadastros/recursos", label: "Recursos", icon: Layers },
    { href: "/cadastros/documentos", label: "Documentos", icon: FileText },
    { href: "/cadastros/calendarios", label: "Calendários Produtivos", icon: CalendarClock },
    { href: "/cadastros/checklists", label: "CheckList", icon: ListChecks },
    { href: "/cadastros/medicoes", label: "Medições", icon: Gauge },
  ] },
  { group: "Análise", items: [
    { href: "/analises", label: "Análises", icon: BarChart3 },
    { href: "/relatorios", label: "Relatórios", icon: FileBarChart },
  ] },
  { group: "Sistema", items: [{ href: "/admin", label: "Admin", icon: ShieldCheck }] },
];
