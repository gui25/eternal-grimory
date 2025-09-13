/**
 * Script de teste para o novo sistema CMS
 */
import { contentManager } from '../lib/cms/content-manager'
import { initializeCMS } from '../lib/cms/init'

async function testCMS() {
  console.log('🧪 Testando novo sistema CMS...')
  
  // Inicializar CMS
  initializeCMS()
  
  try {
    // Teste 1: Buscar NPCs existentes
    console.log('\n📋 Teste 1: Buscar NPCs existentes')
    const npcsResult = await contentManager.findContent({
      type: 'npc',
      limit: 5
    })
    
    if (npcsResult.success) {
      console.log(`✅ Encontrados ${npcsResult.data?.length || 0} NPCs`)
      console.log(`📊 Total: ${npcsResult.meta?.total || 0}`)
    } else {
      console.log('❌ Erro ao buscar NPCs:', npcsResult.error?.message)
    }
    
    // Teste 2: Buscar item específico
    console.log('\n📋 Teste 2: Buscar NPC específico')
    const npcResult = await contentManager.getContent('npc', 'eldrin-o-exilado')
    
    if (npcResult.success) {
      console.log(`✅ NPC encontrado: ${npcResult.data?.name}`)
    } else {
      console.log('❌ Erro ao buscar NPC:', npcResult.error?.message)
    }
    
    // Teste 3: Testar cache
    console.log('\n📋 Teste 3: Testar cache')
    const { cache } = await import('../lib/cms/cache')
    const cacheStats = cache.getStats()
    console.log('📊 Cache status:', cacheStats)
    
    // Teste 4: Testar hooks
    console.log('\n📋 Teste 4: Testar hooks')
    const { hookManager } = await import('../lib/cms/hooks')
    const hooks = hookManager.getRegisteredHooks()
    console.log(`🔗 Hooks registrados: ${hooks.length} grupos`)
    
    console.log('\n🎉 Todos os testes concluídos!')
    
  } catch (error) {
    console.error('💥 Erro durante os testes:', error)
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  testCMS()
}

export { testCMS }
