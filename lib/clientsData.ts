import {
  Cliente as ClientRecord,
  ServicoContratado as ContractedService,
  TimelineItem as ActivityLog,
  Documento as DocumentItem,
  AIRecommendation,
  JourneyStage,
  ABDUCTION_STAGES,
} from "@/types";

export type {
  ClientRecord,
  ContractedService,
  ActivityLog,
  DocumentItem,
  JourneyStage,
};

export { ABDUCTION_STAGES };

export interface AIClientIntelligence {
  summary: string;
  biggestBottleneck: string;
  biggestOpportunity: string;
  weeklyPriority: string;
  recommendations: AIRecommendation[];
}


export const MOCK_CLIENTS: ClientRecord[] = [
  {
    id: "lumina-skincare",
    name: "Lumina Skincare",
    contactPerson: "Mariana Alvez (CMO)",
    email: "mariana@luminaskincare.com.br",
    company: "Lumina Skincare Ltda",
    segment: "E-commerce Beauty",
    alienScore: 94,
    journeyStage: "Em Escala" as JourneyStage,
    healthStatus: "Excelente",
    entryDate: "12/Jan/2025",
    lastUpdate: "Hoje às 14:30",
    nextMeeting: "02/Ago às 10:00",
    currentRoas: "6.8x",
    currentRoi: "12.4x",
    generatedRevenue: "R$ 1.840.000",
    primaryObjective: "Escalar receita mensal para R$ 500k com ROAS acima de 6.0x",
    aiIntelligence: {
      summary:
        "Operação saudável em forte tração. O segmento de dermo-cosméticos apresenta retenção de 38% em recompra nos primeiros 60 dias.",
      biggestBottleneck:
        "Fadiga de criativos no Meta Ads em campanhas de topo de funil (frequência média de 4.2x).",
      biggestOpportunity:
        "Expansão para TikTok Ads com criativos estilo UGC e oferta de kit exclusivo de primavera.",
      weeklyPriority:
        "Subir 5 novos conceitos de UGC e iniciar teste A/B na Landing Page de lançamento.",
      recommendations: [
        {
          id: "rec-lum-1",
          title: "Realocação de R$ 15k para TikTok Ads",
          description:
            "O público jovem (18-28 anos) apresentou CPA 24% menor em testes preliminares no TikTok.",
          expectedImpact: "+R$ 85.000 em receita vendas",
          action: "Aprovar transferência de verba",
        },
        {
          id: "rec-lum-2",
          title: "Ativação da régua de e-mail pós-compra (Cross-sell)",
          description:
            "Clientes que compram o Sérum Facial têm 45% de probabilidade de adquirir o Protetor Solar se abordados no 14º dia.",
          expectedImpact: "+12% no LTV em 90 dias",
          action: "Ativar automação no Klaviyo",
        },
        {
          id: "rec-lum-3",
          title: "Otimização de checkout 1-clique no Shopify",
          description:
            "A redução de campos no checkout móvel pode diminuir o abandono de carrinho em 8.5%.",
          expectedImpact: "+R$ 34.000 mensais",
          action: "Solicitar implementação à equipe de Tech",
        },
      ],
    },
    contractedServices: [
      {
        id: "s-1",
        name: "Gestão de Tráfego Pago",
        category: "Gestão de Tráfego",
        status: "Ativo",
        assignee: "Lucas Rocha (Mídia)",
        lastResults: "ROAS de 6.8x em Meta Ads e Google Search",
        nextAction: "Duplicar orçamento do conjunto 'Lookalike 1% Compradores'",
        aiRecommendation: "Aumentar investimento em retargeting dinâmico do catálogo",
      },
      {
        id: "s-2",
        name: "Social Media & Branding",
        category: "Social Media",
        status: "Ativo",
        assignee: "Beatriz Lima (Design)",
        lastResults: "+45k interações e 1.2M alcance orgânico",
        nextAction: "Aprovar calendário editorial da semana 32",
        aiRecommendation: "Apostar em vídeos curtos de rotina noturna de cuidados com a pele",
      },
      {
        id: "s-3",
        name: "Automação de E-mail & CRM",
        category: "Automações",
        status: "Otimizando",
        assignee: "Gabriel Alencar (Growth)",
        lastResults: "Taxa de abertura de 42.8% nas sequências de boas-vindas",
        nextAction: "Configurar fluxo automático de carrinho abandonado com cupom 5%",
        aiRecommendation: "Testar assunto curto com emoji de brilho ✨ no e-mail 2",
      },
      {
        id: "s-4",
        name: "Produção de Vídeo & Foto UGC",
        category: "Fotografia e Vídeo",
        status: "Em Produção",
        assignee: "Rafael Costa (Audiovisual)",
        lastResults: "8 vídeos gravados com criadoras de conteúdo contratadas",
        nextAction: "Edição final e adição de legendas dinâmicas estilo TikTok",
        aiRecommendation: "Priorizar os primeiros 3 segundos com gancho visual direto",
      },
    ],
    activities: [
      {
        id: "act-1",
        title: "Reunião Quinzanal de Growth realizada",
        type: "Reunião realizada",
        timestamp: "Hoje às 10:00",
        description: "Apresentação dos resultados de Julho e aprovação da meta de R$ 500k.",
        author: "Gabriel Alencar",
      },
      {
        id: "act-2",
        title: "Novo lote de criativos UGC aprovado",
        type: "Criativo aprovado",
        timestamp: "Ontem às 16:45",
        description: "5 variações de anúncios de depoimento aprovadas pela cliente.",
        author: "Mariana Alvez",
      },
      {
        id: "act-3",
        title: "Landing Page de Sérum publicada",
        type: "Landing Page publicada",
        timestamp: "26/Jul às 18:20",
        description: "Página otimizada com prova social e vídeos curtos integrada ao Shopify.",
        author: "Beatriz Lima",
      },
      {
        id: "act-4",
        title: "Campanha de TikTok Ads iniciada",
        type: "Campanha iniciada",
        timestamp: "24/Jul às 09:00",
        description: "Início do teste de público jovem com orçamento inicial de R$ 500/dia.",
        author: "Lucas Rocha",
      },
      {
        id: "act-5",
        title: "Novo insight de inteligência artificial",
        type: "Novo insight da IA",
        timestamp: "22/Jul às 14:10",
        description: "Oportunidade identificada: público de 25-34 anos com alta intenção de recompra.",
        author: "Alien IA Core",
      },
    ],
    documents: [
      {
        id: "doc-1",
        name: "Plano Estratégico de Escala H2-2026.pdf",
        category: "Apresentações",
        size: "4.2 MB",
        updatedAt: "28/Jul/2026",
        format: "pdf",
        url: "#",
      },
      {
        id: "doc-2",
        name: "Contrato de Prestação de Serviços Growth.pdf",
        category: "Contratos",
        size: "1.8 MB",
        updatedAt: "12/Jan/2025",
        format: "pdf",
        url: "#",
      },
      {
        id: "doc-3",
        name: "Briefing de Lançamento de Linha Solar.doc",
        category: "Briefings",
        size: "850 KB",
        updatedAt: "15/Jul/2026",
        format: "doc",
        url: "#",
      },
      {
        id: "doc-4",
        name: "Asset Kit - Identidade Visual & Logos.figma",
        category: "Arquivos",
        size: "18.4 MB",
        updatedAt: "05/Mai/2026",
        format: "figma",
        url: "#",
      },
    ],
  },
  {
    id: "nexus-saas",
    name: "Nexus SaaS",
    contactPerson: "Roberto Prado (CEO)",
    email: "roberto@nexussaas.com",
    company: "Nexus Software Technologies",
    segment: "B2B Software",
    alienScore: 78,
    journeyStage: "Em Diagnóstico" as JourneyStage,
    healthStatus: "Atenção",
    entryDate: "05/Jun/2026",
    lastUpdate: "Hoje às 11:15",
    nextMeeting: "31/Jul às 14:00",
    currentRoas: "2.4x",
    currentRoi: "3.8x",
    generatedRevenue: "R$ 420.000",
    primaryObjective: "Reduzir o CAC em 35% e estruturar máquina de vendas outbound/inbound",
    aiIntelligence: {
      summary:
        "Fase de diagnóstico da arquitetura de aquisição. O ciclo de vendas longo (45 dias) exige nutrição contínua.",
      biggestBottleneck:
        "Taxa de conversão de Lead para Demonstração abaixo de 3.2% (benchmark do segmento é 7.5%).",
      biggestOpportunity:
        "Implementação de calculadora de ROI interativa no topo do site para retenção de tomadores de decisão.",
      weeklyPriority:
        "Revisar qualificação de leads no formulário e alinhar critérios de MQL com time de vendas.",
      recommendations: [
        {
          id: "rec-nex-1",
          title: "Simplificação do formulário de demonstração",
          description:
            "Reduzir de 9 para 5 campos no formulário para diminuir fricção de preenchimento.",
          expectedImpact: "+35% em conversões de MQL",
          action: "Aprovar novo formulário",
        },
        {
          id: "rec-nex-2",
          title: "Reestruturação de palavras-chave de fundo no Google Search",
          description:
            "Termos amplos estão consumindo 40% da verba sem conversões de oportunidade real.",
          expectedImpact: "Economia de R$ 8.500/mês",
          action: "Negativar termos de baixa intenção",
        },
        {
          id: "rec-nex-3",
          title: "Criar sequência de e-mails B2B para SDRs",
          description:
            "Fluxo de 4 e-mails focados nas dores do CFO pode aumentar a taxa de agendamento em 18%.",
          expectedImpact: "+15 reuniões agendadas/mês",
          action: "Revisar cópia das abordagens",
        },
      ],
    },
    contractedServices: [
      {
        id: "s-nex-1",
        name: "Inbound Marketing & Mídia B2B",
        category: "Gestão de Tráfego",
        status: "Ativo",
        assignee: "Lucas Rocha (Mídia)",
        lastResults: "ROAS de 2.4x e 85 MQLs gerados",
        nextAction: "Focar orçamento exclusivamente em Google Search Fundo de Funil",
        aiRecommendation: "Testar anúncios nativos no LinkedIn Ads para C-levels",
      },
      {
        id: "s-nex-2",
        name: "Reformulação do Site & Landing Pages",
        category: "Sites",
        status: "Em Produção",
        assignee: "Henrique Silva (Tech)",
        lastResults: "Wireframe da nova página institucional aprovado",
        nextAction: "Desenvolvimento do frontend em Next.js com carregamento ultrarrápido",
        aiRecommendation: "Adicionar depoimentos em vídeo de clientes atuais na primeira dobra",
      },
      {
        id: "s-nex-3",
        name: "Branding e Posicionamento B2B",
        category: "Branding",
        status: "Ativo",
        assignee: "Beatriz Lima (Design)",
        lastResults: "Novo guia de marca e pitch deck comercial entregues",
        nextAction: "Revisar templates para apresentações de proposta",
        aiRecommendation: "Padronizar assinaturas de e-mail da equipe comercial",
      },
    ],
    activities: [
      {
        id: "act-nex-1",
        title: "Reunião de Diagnóstico de Vendas realizada",
        type: "Reunião realizada",
        timestamp: "28/Jul às 15:00",
        description: "Análise do pipeline comercial com o time de Inside Sales.",
        author: "Gabriel Alencar",
      },
      {
        id: "act-nex-2",
        title: "Wireframe do novo site aprovado",
        type: "Criativo aprovado",
        timestamp: "25/Jul às 11:30",
        description: "Layout da homepage B2B e página de pricing validados.",
        author: "Roberto Prado",
      },
      {
        id: "act-nex-3",
        title: "Novo insight de inteligência artificial",
        type: "Novo insight da IA",
        timestamp: "23/Jul às 09:15",
        description: "Gargalo no formulário de contato identificado com queda de 45%.",
        author: "Alien IA Core",
      },
    ],
    documents: [
      {
        id: "doc-nex-1",
        name: "Relatório de Diagnóstico de Aquisição.pdf",
        category: "Briefings",
        size: "3.1 MB",
        updatedAt: "20/Jul/2026",
        format: "pdf",
        url: "#",
      },
      {
        id: "doc-nex-2",
        name: "Contrato de Diagnóstico & Growth.pdf",
        category: "Contratos",
        size: "1.5 MB",
        updatedAt: "05/Jun/2026",
        format: "pdf",
        url: "#",
      },
    ],
  },
  {
    id: "aura-health",
    name: "Aura Health",
    contactPerson: "Dr. Fernando Paes (Fundador)",
    email: "fernando@aurahealth.com.br",
    company: "Aura Nutraceuticals Brasil",
    segment: "Suplementos D2C",
    alienScore: 96,
    journeyStage: "Em Escala" as JourneyStage,
    healthStatus: "Excelente",
    entryDate: "18/Nov/2024",
    lastUpdate: "Hoje às 09:40",
    nextMeeting: "04/Ago às 11:00",
    currentRoas: "8.4x",
    currentRoi: "14.8x",
    generatedRevenue: "R$ 3.250.000",
    primaryObjective: "Manter tração de 8.0x+ de ROAS com expansão para novas linhas de produto",
    aiIntelligence: {
      summary:
        "Cliente modelo da agência com altíssima taxa de conversão (4.8%) e LTV consistente no modelo de assinatura.",
      biggestBottleneck:
        "Capacidade de estoque de produto principal (Colágeno Verisol) para suprir alta demanda de vendas.",
      biggestOpportunity:
        "Lançamento do programa de indicação 'Indique um amigo e ganhe R$ 50'.",
      weeklyPriority:
        "Aumentar o orçamento diário em Meta Ads para R$ 2.500/dia mantendo o target de ROAS.",
      recommendations: [
        {
          id: "rec-aur-1",
          title: "Aumento de orçamento em Meta Ads em 25%",
          description:
            "Campanha de Coenzima Q10 mantém ROAS de 9.2x há 3 semanas sem saturação.",
          expectedImpact: "+R$ 120.000 em vendas",
          action: "Aumentar limite de gastos diário",
        },
        {
          id: "rec-aur-2",
          title: "Ativar módulo de Clube de Assinaturas",
          description:
            "Oferecer 15% de desconto para compras recorrentes automatizadas pode aumentar a retenção em 6 meses.",
          expectedImpact: "+R$ 45k MRR recorrente",
          action: "Aprovar integração com plataforma de assinaturas",
        },
        {
          id: "rec-aur-3",
          title: "Publicar kit de fotos profissionais no Instagram",
          description:
            "Fotos de estilo de vida saudável aumentam o engajamento orgânico em 30%.",
          expectedImpact: "Engajamento +30%",
          action: "Liberar acervo de mídia",
        },
      ],
    },
    contractedServices: [
      {
        id: "s-aur-1",
        name: "Gestão de Mídia & Performance",
        category: "Gestão de Tráfego",
        status: "Ativo",
        assignee: "Lucas Rocha (Mídia)",
        lastResults: "ROAS consolidado de 8.4x com R$ 120k investidos no mês",
        nextAction: "Escalar orçamento para R$ 150k no próximo ciclo",
        aiRecommendation: "Manter foco em públicos de saúde e bem-estar acima de 30 anos",
      },
      {
        id: "s-aur-2",
        name: "Produção de Conteúdo e Foto",
        category: "Fotografia e Vídeo",
        status: "Ativo",
        assignee: "Rafael Costa (Audiovisual)",
        lastResults: "Ensaio fotográfico completo entregue e aprovado",
        nextAction: "Planejar sessão de fotos para nova linha de vitaminas",
        aiRecommendation: "Utilizar luz natural e ambientação minimalista nas fotos",
      },
      {
        id: "s-aur-3",
        name: "Google Meu Negócio & SEO Local",
        category: "Google Meu Negócio",
        status: "Ativo",
        assignee: "Camila Torres (SEO)",
        lastResults: "5 estrelas em avaliações e topo nas buscas da região",
        nextAction: "Atualizar catálogo de produtos no perfil comercial",
        aiRecommendation: "Solicitar avaliações para clientes que receberam pedidos nos últimos 7 dias",
      },
    ],
    activities: [
      {
        id: "act-aur-1",
        title: "Campanha de Escala iniciada",
        type: "Campanha iniciada",
        timestamp: "Ontem às 14:00",
        description: "Novos conjuntos de anúncios ativados com foco em ROAS 8x+.",
        author: "Lucas Rocha",
      },
      {
        id: "act-aur-2",
        title: "Reunião estratégica de planejamento Q4",
        type: "Reunião realizada",
        timestamp: "27/Jul às 11:00",
        description: "Definição do plano de lançamento dos novos suplementos.",
        author: "Gabriel Alencar",
      },
    ],
    documents: [
      {
        id: "doc-aur-1",
        name: "Plano de Mídia H2 - Aura Health.pdf",
        category: "Apresentações",
        size: "5.4 MB",
        updatedAt: "25/Jul/2026",
        format: "pdf",
        url: "#",
      },
    ],
  },
  {
    id: "vanguard-fashion",
    name: "Vanguard Fashion",
    contactPerson: "Juliana Rocha (Diretora)",
    email: "juliana@vanguardfashion.com",
    company: "Vanguard Modas & Acessórios",
    segment: "E-commerce D2C",
    alienScore: 82,
    journeyStage: "Em Execução" as JourneyStage,
    healthStatus: "Atenção",
    entryDate: "10/Fev/2026",
    lastUpdate: "Hoje às 12:50",
    nextMeeting: "01/Ago às 15:30",
    currentRoas: "3.4x",
    currentRoi: "5.2x",
    generatedRevenue: "R$ 680.000",
    primaryObjective: "Elevar o ticket médio para R$ 380 e alcançar ROAS de 4.5x",
    aiIntelligence: {
      summary:
        "Fase de execução de novas coleções de vestuário. Boa aceitação visual mas margem pressionada pelo custo de frete.",
      biggestBottleneck:
        "Abandono no momento de cálculo de frete no carrinho de compras.",
      biggestOpportunity:
        "Implementar barra de frete grátis progressiva ('Adicione R$ 40 para frete grátis').",
      weeklyPriority:
        "Lançar teste A/B da régua de frete grátis e atualizar criativos de remarketing no Instagram.",
      recommendations: [
        {
          id: "rec-van-1",
          title: "Implementação de régua dinâmica de frete grátis",
          description:
            "Incentivar o cliente a adicionar mais 1 item para economizar no envio.",
          expectedImpact: "+18% no Ticket Médio",
          action: "Ativar app de frete progressivo",
        },
        {
          id: "rec-van-2",
          title: "Renovação de criativos de carrossel de produtos",
          description:
            "Carrosséis dinâmicos com preços em destaque tiveram 32% mais cliques.",
          expectedImpact: "CTR +32%",
          action: "Subir novo catálogo no Meta Ads",
        },
      ],
    },
    contractedServices: [
      {
        id: "s-van-1",
        name: "Gestão de Mídia & E-commerce",
        category: "Gestão de Tráfego",
        status: "Ativo",
        assignee: "Lucas Rocha (Mídia)",
        lastResults: "ROAS de 3.4x em vestuário feminino",
        nextAction: "Criar campanha de liquidação de inverno com cupons",
        aiRecommendation: "Focar em públicos com afinidade por moda sustentável",
      },
      {
        id: "s-van-2",
        name: "Gestão de Redes Sociais & Moda",
        category: "Social Media",
        status: "Ativo",
        assignee: "Beatriz Lima (Design)",
        lastResults: "Feed estético renovado e Reels com 80k views",
        nextAction: "Programar posts da nova Coleção Primavera",
        aiRecommendation: "Aumentar frequência de Stories com provador em vídeo",
      },
    ],
    activities: [
      {
        id: "act-van-1",
        title: "Criativo de Carrossel aprovado",
        type: "Criativo aprovado",
        timestamp: "Ontem às 17:15",
        description: "Designers aprovaram o novo padrão visual para catálogo.",
        author: "Juliana Rocha",
      },
    ],
    documents: [
      {
        id: "doc-van-1",
        name: "Guia de Estilo & Lookbook.pdf",
        category: "Arquivos",
        size: "12.1 MB",
        updatedAt: "10/Mar/2026",
        format: "pdf",
        url: "#",
      },
    ],
  },
  {
    id: "finpulse",
    name: "FinPulse",
    contactPerson: "Thiago Vasconcelos (Head de Mkt)",
    email: "thiago@finpulse.com.br",
    company: "FinPulse Soluções Financeiras",
    segment: "Fintech B2C",
    alienScore: 98,
    journeyStage: "Case" as JourneyStage,
    healthStatus: "Excelente",
    entryDate: "03/Ago/2024",
    lastUpdate: "Hoje às 15:10",
    nextMeeting: "05/Ago às 09:30",
    currentRoas: "9.1x",
    currentRoi: "18.5x",
    generatedRevenue: "R$ 5.400.000",
    primaryObjective: "Manter liderança de mercado e produzir Alien Case nacional",
    aiIntelligence: {
      summary:
        "História de sucesso emblemática da agência. Caso de estudo de referência em aquisição rápida com CAC reduzido.",
      biggestBottleneck:
        "Saturação da base local de clientes (necessidade de expansão nacional).",
      biggestOpportunity:
        "Publicar o Alien Case em portais do mercado financeiro e impulsionar autoridade da marca.",
      weeklyPriority:
        "Finalizar a edição do vídeo de estudo de caso com o depoimento do Head de Marketing.",
      recommendations: [
        {
          id: "rec-fin-1",
          title: "Publicação do Alien Case em vídeo",
          description:
            "O case com resultado de 9.1x ROAS atrairá novos leads qualificados para a agência e para a fintech.",
          expectedImpact: "Autoridade de Marca Nacional",
          action: "Publicar no canal oficial e LinkedIn",
        },
      ],
    },
    contractedServices: [
      {
        id: "s-fin-1",
        name: "Growth Hacking & Performance Mídia",
        category: "Gestão de Tráfego",
        status: "Ativo",
        assignee: "Gabriel Alencar (Growth)",
        lastResults: "ROAS de 9.1x com retenção recorde",
        nextAction: "Expansão de campanhas para América Latina",
        aiRecommendation: "Manter inteligência de lances automáticos ativada",
      },
      {
        id: "s-fin-2",
        name: "Branding Institucional & Vídeo Case",
        category: "Branding",
        status: "Ativo",
        assignee: "Beatriz Lima (Design)",
        lastResults: "Vídeo case gravado em estúdio profissional",
        nextAction: "Lançamento oficial da campanha de branding",
        aiRecommendation: "Utilizar depoimento real como anúncio principal de autoridade",
      },
    ],
    activities: [
      {
        id: "act-fin-1",
        title: "Alien Case aprovado para publicação",
        type: "Criativo aprovado",
        timestamp: "28/Jul às 16:00",
        description: "Estudo de caso revisado e liberado pelo departamento jurídico da Fintech.",
        author: "Thiago Vasconcelos",
      },
    ],
    documents: [
      {
        id: "doc-fin-1",
        name: "Alien Case Study - FinPulse 9.1x.pdf",
        category: "Apresentações",
        size: "8.9 MB",
        updatedAt: "28/Jul/2026",
        format: "pdf",
        url: "#",
      },
    ],
  },
  {
    id: "solaris-engenharia",
    name: "Solaris Engenharia",
    contactPerson: "Eng. Carlos Eduardo",
    email: "carlos@solariseng.com.br",
    company: "Solaris Projetos & Energia",
    segment: "B2B Solar",
    alienScore: 84,
    journeyStage: "Em Execução" as JourneyStage,
    healthStatus: "Excelente",
    entryDate: "15/Mar/2026",
    lastUpdate: "Ontem às 16:20",
    nextMeeting: "03/Ago às 14:00",
    currentRoas: "4.5x",
    currentRoi: "7.8x",
    generatedRevenue: "R$ 1.120.000",
    primaryObjective: "Gerar 40 orçamentos de projetos fotovoltaicos industriais por mês",
    aiIntelligence: {
      summary:
        "Fase de execução comercial com campanhas regionais em foca em galpões e indústrias.",
      biggestBottleneck:
        "Demora da equipe interna comercial em dar o primeiro contato aos leads (média de 6 horas).",
      biggestOpportunity:
        "Ativar bot de WhatsApp com integração instantânea para agendamento em menos de 5 minutos.",
      weeklyPriority:
        "Treinar a equipe comercial e rodar simulação de atendimento via WhatsApp.",
      recommendations: [
        {
          id: "rec-sol-1",
          title: "Ativação de Automação de WhatsApp instantânea",
          description:
            "Leads atendidos nos primeiros 5 minutos possuem 8x mais chances de agendar visita técnica.",
          expectedImpact: "+40% em agendamentos",
          action: "Conectar bot à API oficial do WhatsApp",
        },
      ],
    },
    contractedServices: [
      {
        id: "s-sol-1",
        name: "Mídia Geolocalizada & Google Search",
        category: "Gestão de Tráfego",
        status: "Ativo",
        assignee: "Lucas Rocha (Mídia)",
        lastResults: "45 leads industriais qualificados no último mês",
        nextAction: "Expandir área de cobertura de anúncios para raio de 150km",
        aiRecommendation: "Palavras-chave de energia solar corporativa em destaque",
      },
      {
        id: "s-sol-2",
        name: "Google Meu Negócio & Avaliações",
        category: "Google Meu Negócio",
        status: "Ativo",
        assignee: "Camila Torres (SEO)",
        lastResults: "Perfil certificado e topo das buscas da região metropolitana",
        nextAction: "Adicionar fotos de instalações concluídas em indústrias",
        aiRecommendation: "Manter atualizados os horários e fotos de equipe em campo",
      },
    ],
    activities: [
      {
        id: "act-sol-1",
        title: "Campanha Geolocalizada iniciada",
        type: "Campanha iniciada",
        timestamp: "20/Jul às 08:30",
        description: "Anúncios focados em donos de galpões e fábricas ativados.",
        author: "Lucas Rocha",
      },
    ],
    documents: [
      {
        id: "doc-sol-1",
        name: "Apresentação Comercial Solaris B2B.pdf",
        category: "Apresentações",
        size: "3.7 MB",
        updatedAt: "15/Mar/2026",
        format: "pdf",
        url: "#",
      },
    ],
  },
  {
    id: "bistro-gourmet",
    name: "Bistro Gourmet",
    contactPerson: "Chef André Martins",
    email: "andre@bistrogourmet.com.br",
    company: "Bistro Gourmet Gastronomia",
    segment: "Gastronomia",
    alienScore: 72,
    journeyStage: "Em Diagnóstico" as JourneyStage,
    healthStatus: "Atenção",
    entryDate: "01/Jul/2026",
    lastUpdate: "27/Jul às 17:00",
    nextMeeting: "31/Jul às 16:30",
    currentRoas: "2.8x",
    currentRoi: "4.1x",
    generatedRevenue: "R$ 180.000",
    primaryObjective: "Lotar as reservas de quinta a domingo e impulsionar delivery de alta gastronomia",
    aiIntelligence: {
      summary:
        "Novo cliente em fase de diagnóstico de público local e posicionamento gastronômico.",
      biggestBottleneck:
        "Falta de fotos profissionais dos pratos e ambiente (anúncios utilizando fotos de celular).",
      biggestOpportunity:
        "Realizar sessão fotográfica profissional e lançar campanha de reservas via WhatsApp.",
      weeklyPriority:
        "Agendar a sessão fotográfica com a equipe de audiovisual da agência.",
      recommendations: [
        {
          id: "rec-bis-1",
          title: "Sessão Fotográfica Gastronômica Profissional",
          description:
            "Fotos profissionais com iluminação adequada aumentam a taxa de conversão de anúncios em até 65%.",
          expectedImpact: "+65% em reservas",
          action: "Confirmar data da produção fotográfica",
        },
      ],
    },
    contractedServices: [
      {
        id: "s-bis-1",
        name: "Fotografia & Produção Gastronômica",
        category: "Fotografia e Vídeo",
        status: "Em Produção",
        assignee: "Rafael Costa (Audiovisual)",
        lastResults: "Briefing de estilo gastronômico alinhado",
        nextAction: "Realizar gravação dos pratos principais e drinks",
        aiRecommendation: "Focar em tomadas de close-up (slow-motion) dos pratos sendo servidos",
      },
      {
        id: "s-bis-2",
        name: "Gestão do Perfil Google Meu Negócio",
        category: "Google Meu Negócio",
        status: "Ativo",
        assignee: "Camila Torres (SEO)",
        lastResults: "Cardápio digital atualizado com preços",
        nextAction: "Configurar botão direto para reserva de mesas",
        aiRecommendation: "Incentivar garçons a solicitarem avaliações de clientes satisfeitos",
      },
    ],
    activities: [
      {
        id: "act-bis-1",
        title: "Reunião de Alinhamento de Cardápio realizada",
        type: "Reunião realizada",
        timestamp: "27/Jul às 17:00",
        description: "Definição dos pratos de destaque para o novo cardápio digital.",
        author: "Gabriel Alencar",
      },
    ],
    documents: [
      {
        id: "doc-bis-1",
        name: "Briefing Gastronômico & Cardápio.pdf",
        category: "Briefings",
        size: "2.1 MB",
        updatedAt: "01/Jul/2026",
        format: "pdf",
        url: "#",
      },
    ],
  },
  {
    id: "pulse-gym",
    name: "Pulse Gym",
    contactPerson: "Renata Silveira (Gerente)",
    email: "renata@pulsegym.com.br",
    company: "Pulse Fitness & Wellness",
    segment: "Fitness & Saúde",
    alienScore: 91,
    journeyStage: "Em Escala" as JourneyStage,
    healthStatus: "Excelente",
    entryDate: "10/Out/2025",
    lastUpdate: "Hoje às 13:00",
    nextMeeting: "06/Ago às 10:00",
    currentRoas: "5.8x",
    currentRoi: "10.2x",
    generatedRevenue: "R$ 940.000",
    primaryObjective: "Atingir 1.200 alunos matriculados e zerar a capacidade ociosa do horário de pico",
    aiIntelligence: {
      summary:
        "Rede de academias com altíssima taxa de conversão em convites para 'Pass de 3 Dias Grátis'.",
      biggestBottleneck:
        "Horários de menor movimento (10h às 15h) com baixa frequência de alunos.",
      biggestOpportunity:
        "Lançar plano promocional 'Off-Peak' (Horário Econômico) para estudantes e aposentados.",
      weeklyPriority:
        "Lançar a campanha do Plano Horário Econômico com foco em landing page dedicada.",
      recommendations: [
        {
          id: "rec-pul-1",
          title: "Lançamento da Campanha 'Plano Horário Econômico'",
          description:
            "Ocupar horários ociosos gerará receita incremental com custo operacional zero.",
          expectedImpact: "+150 novas matrículas",
          action: "Ativar anúncios segmentados de horário",
        },
      ],
    },
    contractedServices: [
      {
        id: "s-pul-1",
        name: "Tráfego Local para Academias",
        category: "Gestão de Tráfego",
        status: "Ativo",
        assignee: "Lucas Rocha (Mídia)",
        lastResults: "320 Free Passes baixados no mês",
        nextAction: "Otimizar raio de alcance de 3km para 5km ao redor das unidades",
        aiRecommendation: "Utilizar vídeos de alunos reais treinando nas unidades",
      },
      {
        id: "s-pul-2",
        name: "Landing Pages de Alta Conversão",
        category: "Sites",
        status: "Ativo",
        assignee: "Henrique Silva (Tech)",
        lastResults: "Página de Free Pass com 22% de taxa de conversão",
        nextAction: "Manter teste A/B de chamadas de ação ativo",
        aiRecommendation: "Destacar o botão de resgate em verde luminoso",
      },
    ],
    activities: [
      {
        id: "act-pul-1",
        title: "Landing Page de Free Pass atualizada",
        type: "Landing Page publicada",
        timestamp: "25/Jul às 10:00",
        description: "Nova versão com carregamento rápido de 0.8s aprovada.",
        author: "Henrique Silva",
      },
    ],
    documents: [
      {
        id: "doc-pul-1",
        name: "Plano de Crescimento de Matrículas 2026.pdf",
        category: "Apresentações",
        size: "4.1 MB",
        updatedAt: "10/Out/2025",
        format: "pdf",
        url: "#",
      },
    ],
  },
];

export function getClientById(id: string): ClientRecord | undefined {
  return MOCK_CLIENTS.find((c) => c.id === id);
}
