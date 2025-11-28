-- Gestion de l'API
NXT.API = {}
NXT.API.Authenticated = false
NXT.API.Features = {}

-- Authentifier avec l'API
function NXT.API.Authenticate()
    PerformHttpRequest(Config.APIEndpoint .. '/api/server/heartbeat', function(statusCode, response, headers)
        if statusCode == 200 then
            local data = json.decode(response)
            if data and data.success then
                NXT.API.Authenticated = true
                NXT.API.Features = data.features or {}
                NXT.Bans = data.bans or {}
                
                -- Mettre à jour les détections actives
                if NXT.API.Features then
                    Config.Detections.Aimbot = NXT.API.Features.aimbot or false
                    Config.Detections.SpeedHack = NXT.API.Features.speedhack or false
                    Config.Detections.Noclip = NXT.API.Features.noclip or false
                    Config.Detections.GodMode = NXT.API.Features.godmode or false
                    Config.Detections.WeaponModifier = NXT.API.Features.weaponModifier or false
                    Config.Detections.VehicleModifier = NXT.API.Features.vehicleModifier or false
                    Config.Detections.Teleport = NXT.API.Features.teleport or false
                    Config.Detections.ResourceInjection = NXT.API.Features.resourceInjection or false
                    Config.Detections.MenuDetection = NXT.API.Features.menuDetection or false
                end
                
                NXT.Log("✅ Authentifié avec succès!", "API")
                NXT.Log(string.format("🛡️ Fonctionnalités actives: %d", #NXT.API.Features), "API")
            else
                NXT.Log("❌ Réponse API invalide", "ERROR")
            end
        else
            NXT.Log(string.format("❌ Échec authentification API (Code: %d)", statusCode), "ERROR")
            NXT.API.Authenticated = false
        end
    end, 'POST', json.encode({
        players = NXT.GetOnlinePlayers(),
        maxPlayers = Config.MaxPlayers,
        detections = {}
    }), {
        ['Content-Type'] = 'application/json',
        ['x-license-key'] = Config.LicenseKey
    })
end

-- Heartbeat régulier
function NXT.API.Heartbeat()
    if not NXT.API.Authenticated then
        NXT.API.Authenticate()
        return
    end
    
    local detections = {}
    for i, detection in ipairs(NXT.Detections) do
        if i <= 50 then -- Limiter à 50 détections par heartbeat
            table.insert(detections, detection)
        end
    end
    
    PerformHttpRequest(Config.APIEndpoint .. '/api/server/heartbeat', function(statusCode, response, headers)
        if statusCode == 200 then
            local data = json.decode(response)
            if data and data.success then
                -- Mettre à jour les fonctionnalités et bans
                NXT.API.Features = data.features or {}
                NXT.Bans = data.bans or {}
            end
        end
    end, 'POST', json.encode({
        players = NXT.GetOnlinePlayers(),
        maxPlayers = Config.MaxPlayers,
        detections = detections
    }), {
        ['Content-Type'] = 'application/json',
        ['x-license-key'] = Config.LicenseKey
    })
    
    -- Nettoyer les détections envoyées
    if #detections > 0 then
        local remaining = {}
        for i = 51, #NXT.Detections do
            table.insert(remaining, NXT.Detections[i])
        end
        NXT.Detections = remaining
    end
end

-- Envoyer une détection
function NXT.API.SendDetection(detection)
    table.insert(NXT.Detections, detection)
    
    PerformHttpRequest(Config.APIEndpoint .. '/api/server/detection', function(statusCode, response, headers)
        -- Optionnel: gérer la réponse
    end, 'POST', json.encode(detection), {
        ['Content-Type'] = 'application/json',
        ['x-license-key'] = Config.LicenseKey
    })
end

-- Envoyer un ban
function NXT.API.SendBan(ban)
    PerformHttpRequest(Config.APIEndpoint .. '/api/server/' .. Config.LicenseKey .. '/ban', function(statusCode, response, headers)
        if statusCode == 200 then
            NXT.Log("Ban synchronisé avec l'API", "API")
        end
    end, 'POST', json.encode(ban), {
        ['Content-Type'] = 'application/json',
        ['Authorization'] = 'Bearer ' .. Config.LicenseKey
    })
end

-- Démarrer le heartbeat
CreateThread(function()
    -- Première authentification
    Wait(5000) -- Attendre que le serveur soit prêt
    NXT.API.Authenticate()
    
    -- Heartbeat régulier
    while true do
        Wait(Config.HeartbeatInterval * 1000)
        NXT.API.Heartbeat()
    end
end)
