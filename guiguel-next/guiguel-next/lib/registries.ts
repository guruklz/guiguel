export type FieldType = "text" | "number" | "select" | "asset";
export interface RegField { key: string; label: string; type?: FieldType; options?: string[] }
export interface Registry { slug: string; title: string; fields: RegField[]; rows: (string | number)[][] }
export const REGIONS = ["Injeção", "Utilidades", "Acabamento", "Embalagem", "Manutenção", "Expedição"];

export const REGISTRIES: Registry[] = [
  { slug: "tags", title: "TAGs", fields: [{ key: "tag", label: "TAG" }, { key: "asset", label: "Equipamento", type: "asset" }, { key: "desc", label: "Descrição" }],
    rows: [["INJ-01-HID", "a01", "Sistema hidráulico"], ["SEL-01-RES", "a12", "Resistência de selagem"], ["CMP-01-PRS", "a10", "Pressostato do compressor"]] },
  { slug: "lis", title: "Locais de instalação (LIs)", fields: [{ key: "cod", label: "Código" }, { key: "nome", label: "Local de instalação" }, { key: "regiao", label: "Região", type: "select", options: REGIONS }],
    rows: [["LI-INJ", "Linha de injeção", "Injeção"], ["LI-UTL", "Casa de utilidades", "Utilidades"], ["LI-ACB", "Linha de acabamento", "Acabamento"], ["LI-EMB", "Linha de embalagem", "Embalagem"]] },
  { slug: "locais", title: "Locais", fields: [{ key: "nome", label: "Local" }, { key: "regiao", label: "Região", type: "select", options: REGIONS }],
    rows: [["Galpão principal", "Injeção"], ["Sala de compressores", "Utilidades"], ["Oficina de manutenção", "Manutenção"], ["Docas de expedição", "Expedição"]] },
  { slug: "regioes", title: "Regiões", fields: [{ key: "nome", label: "Região" }, { key: "resp", label: "Responsável" }],
    rows: [["Injeção", "Rodrigo Menezes"], ["Utilidades", "Carlos Alves"], ["Acabamento", "Ana Souza"], ["Embalagem", "Marcos Lima"]] },
  { slug: "pecas", title: "Peças sobressalentes", fields: [{ key: "cod", label: "Código" }, { key: "nome", label: "Peça" }, { key: "asset", label: "Equipamento", type: "asset" }, { key: "qtd", label: "Qtd", type: "number" }],
    rows: [["PS-01", "Resistência 12 cm", "a03", 4], ["PS-02", "Cartucho de selagem", "a12", 2], ["PS-03", "Bico de injeção", "a05", 1]] },
  { slug: "transferencias", title: "Transferência de estoque", fields: [{ key: "peca", label: "Peça" }, { key: "de", label: "De" }, { key: "para", label: "Para" }, { key: "qtd", label: "Qtd", type: "number" }],
    rows: [["Filtro de óleo hidráulico", "Almoxarifado", "Manutenção", 2], ["Rolamento 6205", "Manutenção", "Utilidades", 1]] },
  { slug: "fornecedores", title: "Fornecedores", fields: [{ key: "nome", label: "Fornecedor" }, { key: "email", label: "E-mail" }, { key: "tel", label: "Telefone" }],
    rows: [["Plastek Peças Industriais", "vendas@plastek.exemplo", "(15) 3000-1000"], ["Hidrosul Hidráulica", "contato@hidrosul.exemplo", "(11) 4000-2000"]] },
  { slug: "requisicoes", title: "Requisições de materiais", fields: [{ key: "item", label: "Item" }, { key: "qtd", label: "Qtd", type: "number" }, { key: "sol", label: "Solicitante" }, { key: "status", label: "Situação", type: "select", options: ["Aberta", "Aprovada", "Entregue"] }],
    rows: [["Resistência de aquecimento", 6, "Marcos Lima", "Aberta"], ["Cliché de tampografia", 2, "Ana Souza", "Aprovada"]] },
  { slug: "ferramentas", title: "Ferramentas", fields: [{ key: "cod", label: "Código" }, { key: "nome", label: "Ferramenta" }, { key: "status", label: "Situação", type: "select", options: ["Disponível", "Em uso", "Em calibração"] }],
    rows: [["FE-01", "Torquímetro", "Em calibração"], ["FE-02", "Multímetro", "Disponível"], ["FE-03", "Chave de impacto", "Em uso"]] },
  { slug: "recursos", title: "Recursos", fields: [{ key: "nome", label: "Recurso" }, { key: "tipo", label: "Tipo", type: "select", options: ["Equipe", "Veículo", "Equipamento de apoio"] }, { key: "custo", label: "Custo por hora (R$)", type: "number" }],
    rows: [["Equipe mecânica", "Equipe", 85], ["Empilhadeira de apoio", "Equipamento de apoio", 40]] },
  { slug: "documentos", title: "Documentos", fields: [{ key: "titulo", label: "Documento" }, { key: "asset", label: "Equipamento", type: "asset" }, { key: "tipo", label: "Tipo", type: "select", options: ["Manual", "Desenho", "Certificado", "Procedimento"] }],
    rows: [["Manual da injetora", "a01", "Manual"], ["Certificado do vaso de pressão", "a10", "Certificado"]] },
  { slug: "calendarios", title: "Calendários produtivos", fields: [{ key: "nome", label: "Calendário" }, { key: "turnos", label: "Turnos" }, { key: "dias", label: "Dias por semana", type: "number" }],
    rows: [["Produção em 3 turnos", "06h-14h, 14h-22h, 22h-06h", 6], ["Manutenção", "Comercial, 08h às 17h", 5]] },
  { slug: "checklists", title: "CheckList", fields: [{ key: "nome", label: "CheckList" }, { key: "itens", label: "Itens (separados por ponto e vírgula)" }, { key: "tipo", label: "Aplicação", type: "select", options: ["Preventiva", "Inspeção", "Segurança"] }],
    rows: [["Partida da injetora", "Nível de óleo; Pressão; Temperaturas; Molde fixo", "Preventiva"], ["Segurança antes da intervenção", "Bloqueio de energia; EPI; Área isolada", "Segurança"]] },
  { slug: "medicoes", title: "Medições", fields: [{ key: "asset", label: "Equipamento", type: "asset" }, { key: "grandeza", label: "Grandeza" }, { key: "valor", label: "Valor", type: "number" }, { key: "un", label: "Unidade" }],
    rows: [["a10", "Pressão de saída", 8.2, "bar"], ["a01", "Temperatura do óleo", 52, "°C"]] },
];
export const registryBySlug = (slug: string) => REGISTRIES.find((r) => r.slug === slug);
