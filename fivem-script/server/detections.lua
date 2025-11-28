-- Système de détections serveur
NXT.Detection = {}

-- Enregistrer une détection
function NXT.Detection.Report(source, detectionType, details, action)
    action = action or "WARNED"
    
    local playerName = GetPlayerName(source)
    local playerId = tonumber(source)
    local identifiers = NXT.GetPlayerIdentifiers(source)
    
    local detection = {
        playerName = playerName,
        playerId = playerId,
        identifiers = identifiers,
        type = detectionType,
        details = details,
        action = action,
        timestamp = os.time()
    }
    
    -- Log local
    NXT.Log(string.format("🚨 Détection: %s | Joueur: %s | Action: %s", detectionType, playerName, action), "DETECTION")
    
    -- Envoyer à l'API
    NXT.API.SendDetection(detection)
    
    -- Webhook Discord
    if Config.Webhook.Enabled then
        NXT.SendWebhook({
            title = "🚨 DÉTECTION: " .. detectionType,
            description = string.format("**Joueur:** %s\n**Action:** %s\n**Détails:** %s", 
                playerName, action, json.encode(details)),
            color = 16776960 -- Jaune
        })
    end
    
    -- Actions automatiques
    if action == "BANNED" and Config.AutoBan then
        NXT.BanPlayer(source, detectionType, false)
    elseif action == "KICKED" and Config.AutoKick then
        NXT.KickPlayer(source, detectionType)
    end
end

-- Event: Détection depuis le client
RegisterNetEvent('nxt:detection', function(detectionType, details)
    local source = source
    
    -- Vérifier que la détection est activée
    if not Config.Detections[detectionType:gsub(" ", "")] then
        return
    end
    
    NXT.Detection.Report(source, detectionType, details, "WARNED")
end)

-- Event: Explosion
AddEventHandler('explosionEvent', function(source, ev)
    local source = source
    
    if not Config.Detections.ExplosionSpam then return end
    
    -- Vérifier explosion blacklistée
    for _, blacklistedType in ipairs(Config.BlacklistedExplosions) do
        if ev.explosionType == blacklistedType then
            CancelEvent()
            NXT.Detection.Report(source, "Explosion Blacklistée", {
                explosionType = ev.explosionType,
                coords = ev.posX .. ", " .. ev.posY .. ", " .. ev.posZ
            }, "KICKED")
            return
        end
    end
    
    -- Anti-spam explosions
    if not NXT.Players[source] then
        NXT.Players[source] = {explosions = {}}
    end
    
    local now = GetGameTimer()
    local recentExplosions = 0
    
    for i, time in ipairs(NXT.Players[source].explosions) do
        if now - time < Config.Limits.ExplosionPeriod then
            recentExplosions = recentExplosions + 1
        end
    end
    
    table.insert(NXT.Players[source].explosions, now)
    
    if recentExplosions >= Config.Limits.MaxExplosions then
        CancelEvent()
        NXT.Detection.Report(source, "Explosion Spam", {
            count = recentExplosions,
            period = Config.Limits.ExplosionPeriod
        }, "KICKED")
    end
end)

-- Event: Give weapon
AddEventHandler('weaponDamageEvent', function(source, data)
    if not Config.Detections.WeaponModifier then return end
    
    local weaponHash = data.weaponType
    
    -- Vérifier arme blacklistée
    for _, blacklistedWeapon in ipairs(Config.BlacklistedWeapons) do
        if weaponHash == blacklistedWeapon then
            NXT.Detection.Report(source, "Arme Blacklistée", {
                weapon = weaponHash
            }, "KICKED")
            return
        end
    end
end)

-- Commande admin pour kick
RegisterCommand('nxtkick', function(source, args, rawCommand)
    if source == 0 or IsPlayerAceAllowed(source, 'nxt.admin') then
        local targetId = tonumber(args[1])
        local reason = table.concat(args, " ", 2) or "Aucune raison"
        
        if targetId then
            NXT.KickPlayer(targetId, reason)
        end
    end
end, true)

-- Commande admin pour ban
RegisterCommand('nxtban', function(source, args, rawCommand)
    if source == 0 or IsPlayerAceAllowed(source, 'nxt.admin') then
        local targetId = tonumber(args[1])
        local reason = table.concat(args, " ", 2) or "Aucune raison"
        
        if targetId then
            NXT.BanPlayer(targetId, reason, true)
        end
    end
end, true)
