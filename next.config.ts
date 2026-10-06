import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /**
   * Libera o acesso ao servidor de DESENVOLVIMENTO a partir de outros
   * dispositivos da rede local (celular, tablet) usando o IP da maquina.
   *
   * Sem isso, o Next bloqueia com HTTP 403 as requisicoes cross-origin aos
   * assets de dev (`/_next/static/...` e o canal de hot reload). O HTML chega
   * normalmente, mas o JavaScript nao carrega: a tela aparece montada e nada
   * interativo funciona - abas, tooltips, menus e formularios ficam inertes.
   *
   * Apenas o hostname e comparado (sem esquema e sem porta); `*` cobre um
   * rotulo. Nao tem efeito em producao (Vercel).
   */
  allowedDevOrigins: ['192.168.*.*', '10.*.*.*', '172.16.*.*'],
}

export default nextConfig
