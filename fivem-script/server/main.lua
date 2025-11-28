-- Script serveur principal
NXT.Log("╔═══════════════════════════════════════════╗", "INFO")
NXT.Log("║                                           ║", "INFO")
NXT.Log("║        NXT ANTI-CHEAT v1.0.0              ║", "INFO")
NXT.Log("║   Protection Professionnelle FiveM        ║", "INFO")
NXT.Log("║                                           ║", "INFO")
NXT.Log("╚═══════════════════════════════════════════╝", "INFO")

-- Vérifier la configuration
if Config.LicenseKey == "VOTRE_CLE_DE_LICENCE" then
    NXT.Log("❌ ERREUR: Veuillez configurer votre clé de licence dans config.lua!", "ERROR")
    NXT.Log("❌ Obtenez votre licence sur: https://votre-panel.com", "ERROR")
else
    NXT.Log("✅ Clé de licence configurée", "INFO")
    NXT.Log(string.format("🛡️ Serveur: %s", Config.ServerName), "INFO")
end

-- Event: Joueur se connecte
AddEventHandler('playerConnecting', function(name, setKickReason, deferrals)
    local source = source
    deferrals.defer()
    
    Wait(0)
    deferrals.update("🔍 Vérification NXT Anti-Cheat...")
    
    local identifiers = NXT.GetPlayerIdentifiers(source)
    
    -- Vérifier les bans
    local isBanned, banReason = NXT.IsPlayerBanned(identifiers)
    if isBanned then
        deferrals.done(string.format(Config.Messages.Banned, banReason))
        NXT.Log(string.format("Connexion refusée (banni): %s", name), "BAN")
        return
    end
    
    Wait(100)
    deferrals.update("✅ Vérification réussie!")
    Wait(500)
    deferrals.done()
    
    NXT.Log(string.format("✅ Joueur autorisé: %s", name), "INFO")
end)

-- Event: Joueur rejoint
AddEventHandler('playerJoining', function()
    local source = source
    local playerName = GetPlayerName(source)
    
    -- Initialiser les données du joueur
    NXT.Players[source] = {
        name = playerName,
        identifiers = NXT.GetPlayerIdentifiers(source),
        joined = os.time(),
        explosions = {},
        warnings = 0
    }
    
    -- Envoyer le message de protection au client
    TriggerClientEvent('chat:addMessage', source, {
        color = {0, 255, 0},
        args = {Config.Messages.Protected}
    })
    
    NXT.Log(string.format("Joueur connecté: %s", playerName), "INFO")
end)

-- Event: Joueur quitte
AddEventHandler('playerDropped', function(reason)
    local source = source
    local playerName = GetPlayerName(source)
    
    NXT.Players[source] = nil
    
    NXT.Log(string.format("Joueur déconnecté: %s (Raison: %s)", playerName, reason), "INFO")
end)

-- Event: Recevoir kick depuis le panel
RegisterNetEvent('nxt:server:kick')
AddEventHandler('nxt:server:kick', function(data)
    if data.playerId then
        NXT.KickPlayer(data.playerId, data.reason or "Kicked from panel")
    end
end)

-- Event: Recevoir ban depuis le panel
RegisterNetEvent('nxt:server:ban')
AddEventHandler('nxt:server:ban', function(data)
    if data.identifiers then
        table.insert(NXT.Bans, data)
    end
end)

-- Event: Mettre à jour les features depuis le panel
RegisterNetEvent('nxt:server:updateFeatures')
AddEventHandler('nxt:server:updateFeatures', function(features)
    NXT.API.Features = features
    NXT.Log("Fonctionnalités mises à jour depuis le panel", "INFO")
    
    -- Notifier tous les clients
    TriggerClientEvent('nxt:client:updateFeatures', -1, features)
end)

-- Nettoyer les anciennes données périodiquement
CreateThread(function()
    while true do
        Wait(300000) -- 5 minutes
        
        local now = GetGameTimer()
        for playerId, data in pairs(NXT.Players) do
            if data.explosions then
                local cleaned = {}
                for _, time in ipairs(data.explosions) do
                    if now - time < Config.Limits.ExplosionPeriod * 2 then
                        table.insert(cleaned, time)
                    end
                end
                data.explosions = cleaned
            end
        end
    end
end)

-- Export pour d'autres ressources
exports('BanPlayer', function(source, reason)
    NXT.BanPlayer(source, reason, true)
end)

exports('KickPlayer', function(source, reason)
    NXT.KickPlayer(source, reason)
end)

exports('IsPlayerBanned', function(identifiers)
    return NXT.IsPlayerBanned(identifiers)
end)
