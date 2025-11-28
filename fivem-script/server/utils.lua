-- Utilitaires serveur
NXT = {}
NXT.Players = {}
NXT.Detections = {}
NXT.Bans = {}

-- Logger
function NXT.Log(message, level)
    level = level or "INFO"
    print(string.format("[NXT Anti-Cheat] [%s] %s", level, message))
end

-- Obtenir les identifiants d'un joueur
function NXT.GetPlayerIdentifiers(source)
    local identifiers = {}
    for i = 0, GetNumPlayerIdentifiers(source) - 1 do
        local id = GetPlayerIdentifier(source, i)
        table.insert(identifiers, id)
    end
    return identifiers
end

-- Bannir un joueur
function NXT.BanPlayer(source, reason, permanent)
    permanent = permanent or false
    
    local playerName = GetPlayerName(source)
    local identifiers = NXT.GetPlayerIdentifiers(source)
    
    local ban = {
        playerName = playerName,
        identifiers = identifiers,
        reason = reason,
        bannedBy = "NXT Anti-Cheat",
        permanent = permanent,
        timestamp = os.time()
    }
    
    table.insert(NXT.Bans, ban)
    
    -- Envoyer au serveur API
    NXT.API.SendBan(ban)
    
    -- Kick le joueur
    DropPlayer(source, string.format(Config.Messages.Banned, reason))
    
    NXT.Log(string.format("Joueur banni: %s (Raison: %s)", playerName, reason), "BAN")
    
    -- Webhook Discord
    if Config.Webhook.Enabled then
        NXT.SendWebhook({
            title = "🔨 JOUEUR BANNI",
            description = string.format("**Joueur:** %s\n**Raison:** %s", playerName, reason),
            color = 15158332
        })
    end
end

-- Kick un joueur
function NXT.KickPlayer(source, reason)
    local playerName = GetPlayerName(source)
    
    DropPlayer(source, string.format(Config.Messages.Kicked, reason))
    
    NXT.Log(string.format("Joueur expulsé: %s (Raison: %s)", playerName, reason), "KICK")
end

-- Vérifier si un joueur est banni
function NXT.IsPlayerBanned(identifiers)
    for _, ban in ipairs(NXT.Bans) do
        for _, bannedId in ipairs(ban.identifiers) do
            for _, playerId in ipairs(identifiers) do
                if bannedId == playerId then
                    return true, ban.reason
                end
            end
        end
    end
    return false, nil
end

-- Envoyer webhook Discord
function NXT.SendWebhook(data)
    if not Config.Webhook.Enabled or not Config.Webhook.URL then return end
    
    local embed = {
        {
            title = data.title or Config.Webhook.Title,
            description = data.description or "",
            color = data.color or Config.Webhook.Color,
            footer = {
                text = Config.Webhook.Footer
            },
            timestamp = os.date("!%Y-%m-%dT%H:%M:%S")
        }
    }
    
    PerformHttpRequest(Config.Webhook.URL, function(err, text, headers) end, 'POST', 
        json.encode({embeds = embed}), 
        {['Content-Type'] = 'application/json'}
    )
end

-- Obtenir les joueurs en ligne
function NXT.GetOnlinePlayers()
    local players = {}
    for _, playerId in ipairs(GetPlayers()) do
        local ped = GetPlayerPed(playerId)
        local coords = GetEntityCoords(ped)
        
        table.insert(players, {
            id = tonumber(playerId),
            name = GetPlayerName(playerId),
            identifiers = NXT.GetPlayerIdentifiers(playerId),
            ping = GetPlayerPing(playerId),
            coords = {x = coords.x, y = coords.y, z = coords.z}
        })
    end
    return players
end
