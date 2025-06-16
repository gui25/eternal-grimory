import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { isAdminMode } from '@/lib/dev-utils'
import { CAMPAIGNS } from '@/lib/campaign-config'

const CONTENT_DIR = path.join(process.cwd(), 'content')
const CAMPAIGN_CONFIG_PATH = path.join(process.cwd(), 'lib', 'campaign-config.ts')

// DELETE - Excluir campanha
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminMode()) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  try {
    const { id: campaignId } = await params
    const campaignPath = path.join(CONTENT_DIR, campaignId)

    console.log(`[DELETE] Tentando excluir campanha: ${campaignId}`)
    console.log(`[DELETE] Caminho: ${campaignPath}`)

    // Verificar se a campanha existe no config
    const campaign = CAMPAIGNS.find(c => c.id === campaignId)
    if (!campaign) {
      console.log(`[DELETE] Campanha não encontrada no config: ${campaignId}`)
      return NextResponse.json({ error: 'Campanha não encontrada no sistema' }, { status: 404 })
    }

    console.log(`[DELETE] Campanha encontrada: ${campaign.name}, ativa: ${campaign.active}`)

    // Verificar se o diretório existe
    try {
      await fs.access(campaignPath)
      console.log(`[DELETE] Diretório existe: ${campaignPath}`)
    } catch (error) {
      console.log(`[DELETE] Diretório não encontrado: ${campaignPath}`, error)
      return NextResponse.json({ error: 'Diretório da campanha não encontrado' }, { status: 404 })
    }

    // Verificar se há outras campanhas ativas (não pode deletar a única campanha ativa)
    const activeCampaigns = CAMPAIGNS.filter(c => c.active)
    if (campaign.active && activeCampaigns.length === 1) {
      console.log(`[DELETE] Tentativa de excluir a única campanha ativa`)
      return NextResponse.json({ 
        error: 'Não é possível excluir a única campanha ativa. Crie ou ative outra campanha primeiro.' 
      }, { status: 400 })
    }

    // Função recursiva para deletar diretório e todo seu conteúdo
    async function deleteDirectory(dirPath: string) {
      console.log(`[DELETE] Deletando diretório: ${dirPath}`)
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true })
        console.log(`[DELETE] Encontradas ${entries.length} entradas em ${dirPath}`)
        
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name)
          console.log(`[DELETE] Processando: ${fullPath}, é diretório: ${entry.isDirectory()}`)
          
          if (entry.isDirectory()) {
            await deleteDirectory(fullPath)
          } else {
            await fs.unlink(fullPath)
            console.log(`[DELETE] Arquivo deletado: ${fullPath}`)
          }
        }
        
        await fs.rmdir(dirPath)
        console.log(`[DELETE] Diretório removido: ${dirPath}`)
      } catch (error) {
        console.error(`[DELETE] Erro ao deletar ${dirPath}:`, error)
        throw error
      }
    }

    // Deletar o diretório da campanha
    console.log(`[DELETE] Iniciando exclusão do diretório da campanha`)
    await deleteDirectory(campaignPath)
    console.log(`[DELETE] Diretório da campanha excluído com sucesso`)

    // Remover a campanha do campaign-config.ts
    console.log(`[DELETE] Atualizando campaign-config.ts`)
    const configContent = await fs.readFile(CAMPAIGN_CONFIG_PATH, 'utf-8')
    
    // Algoritmo mais robusto para remover a campanha
    const lines = configContent.split('\n')
    const filteredLines = []
    let inTargetCampaign = false
    let braceCount = 0
    let campaignStartIndex = -1
    let foundCampaignStart = false
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // Detectar início da campanha alvo - procurar por uma linha que contenha o id
      if (line.includes(`id: "${campaignId}"`) && line.includes('"')) {
        console.log(`[DELETE] Encontrada campanha ${campaignId} na linha ${i}`)
        inTargetCampaign = true
        campaignStartIndex = i
        foundCampaignStart = true
        
        // Encontrar o início real do objeto (linha com {)
        let objectStartIndex = i
        while (objectStartIndex >= 0 && !lines[objectStartIndex].includes('{')) {
          objectStartIndex--
        }
        
        // Remover linhas desde o início do objeto
        if (objectStartIndex >= 0 && objectStartIndex < i) {
          // Remover as linhas já adicionadas que fazem parte deste objeto
          const linesToRemove = i - objectStartIndex
          for (let j = 0; j < linesToRemove; j++) {
            filteredLines.pop()
          }
          console.log(`[DELETE] Removendo ${linesToRemove} linhas anteriores do objeto`)
        }
        
        braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length
        
        // Se a linha atual também tem {, contar
        if (lines[objectStartIndex] && lines[objectStartIndex].includes('{')) {
          braceCount += (lines[objectStartIndex].match(/\{/g) || []).length
        }
        
        continue // Pular esta linha
      }
      
      if (inTargetCampaign) {
        braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length
        
        if (braceCount <= 0) {
          console.log(`[DELETE] Fim da campanha ${campaignId} na linha ${i}`)
          inTargetCampaign = false
          
          // Verificar se a próxima linha é uma vírgula isolada e removê-la
          if (i + 1 < lines.length && lines[i + 1].trim() === ',') {
            i++ // Pular a vírgula também
            console.log(`[DELETE] Removendo vírgula órfã na linha ${i + 1}`)
          }
          // Verificar se a linha anterior (antes do objeto) era uma vírgula e removê-la se necessário
          else if (filteredLines.length > 0 && filteredLines[filteredLines.length - 1].trim() === ',') {
            // Verificar se não há mais objetos depois
            let hasMoreObjects = false
            for (let j = i + 1; j < lines.length; j++) {
              if (lines[j].includes('id:') && lines[j].includes('"')) {
                hasMoreObjects = true
                break
              }
              if (lines[j].includes('];')) {
                break
              }
            }
            
            if (!hasMoreObjects) {
              filteredLines.pop() // Remove a vírgula anterior
              console.log(`[DELETE] Removendo vírgula anterior desnecessária`)
            }
          }
        }
        continue // Pular linhas da campanha alvo
      }
      
      filteredLines.push(line)
    }
    
    if (!foundCampaignStart) {
      console.log(`[DELETE] AVISO: Campanha ${campaignId} não foi encontrada no arquivo`)
    }
    
    const updatedConfig = filteredLines.join('\n')
    
    // Verificar se a remoção foi bem-sucedida
    if (updatedConfig.includes(`id: "${campaignId}"`)) {
      console.log(`[DELETE] ERRO: Campanha ${campaignId} ainda está presente no config após remoção`)
      throw new Error(`Falha ao remover campanha ${campaignId} do arquivo de configuração`)
    }
    
    console.log(`[DELETE] Campanha ${campaignId} removida com sucesso do config`)
    
    // Escrever o arquivo atualizado
    await fs.writeFile(CAMPAIGN_CONFIG_PATH, updatedConfig)
    console.log(`[DELETE] campaign-config.ts atualizado com sucesso`)

    return NextResponse.json({ 
      message: 'Campanha excluída com sucesso' 
    })
  } catch (error) {
    console.error('[DELETE] Error deleting campaign:', error)
    return NextResponse.json({ 
      error: `Erro ao excluir campanha: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    }, { status: 500 })
  }
}

// PUT - Editar campanha
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminMode()) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  try {
    const { id: campaignId } = await params
    const { name, description, dmName } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    // Verificar se a campanha existe no config
    const campaign = CAMPAIGNS.find(c => c.id === campaignId)
    if (!campaign) {
      return NextResponse.json({ error: 'Campanha não encontrada no sistema' }, { status: 404 })
    }

    const campaignPath = path.join(CONTENT_DIR, campaignId)

    // Atualizar o campaign-config.ts
    const configContent = await fs.readFile(CAMPAIGN_CONFIG_PATH, 'utf-8')
    
    // Encontrar e atualizar a campanha no array
    const campaignRegex = new RegExp(
      `(\\{[^}]*id:\\s*"${campaignId}"[^}]*)(name:\\s*"[^"]*")([^}]*\\})`,
      'g'
    )
    
    let updatedConfig = configContent.replace(campaignRegex, (match, before, nameField, after) => {
      const updatedMatch = match
        .replace(/name:\s*"[^"]*"/, `name: "${name}"`)
        .replace(/description:\s*"[^"]*"/, `description: "${description || ''}"`)
        .replace(/dmName:\s*"[^"]*"/, `dmName: "${dmName || ''}"`)
      
      return updatedMatch
    })

    // Se a regex acima não funcionou, tentar uma abordagem mais robusta
    if (updatedConfig === configContent) {
      const lines = configContent.split('\n')
      let inCampaign = false
      let braceCount = 0
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        
        if (line.includes(`id: "${campaignId}"`)) {
          inCampaign = true
          braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length
        }
        
        if (inCampaign) {
          if (line.includes('name:')) {
            lines[i] = line.replace(/name:\s*"[^"]*"/, `name: "${name}"`)
          } else if (line.includes('description:')) {
            lines[i] = line.replace(/description:\s*"[^"]*"/, `description: "${description || ''}"`)
          } else if (line.includes('dmName:')) {
            lines[i] = line.replace(/dmName:\s*"[^"]*"/, `dmName: "${dmName || ''}"`)
          }
          
          braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length
          
          if (braceCount <= 0) {
            inCampaign = false
          }
        }
      }
      
      updatedConfig = lines.join('\n')
    }
    
    // Escrever o arquivo atualizado
    await fs.writeFile(CAMPAIGN_CONFIG_PATH, updatedConfig)

    return NextResponse.json({ 
      message: 'Campanha atualizada com sucesso',
      campaign: {
        id: campaignId,
        name,
        description: description || '',
        dmName: dmName || ''
      }
    })
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json({ error: 'Erro ao atualizar campanha' }, { status: 500 })
  }
} 