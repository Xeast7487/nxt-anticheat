-- Script client principal
CreateThread(function()
    Wait(1000)
    
    -- Initialisation
    print("^2[NXT Anti-Cheat]^7 Client initialisé")
    print("^2[NXT Anti-Cheat]^7 Protection active!")
    
    NXT.Protected = true
    
    -- Notification au joueur
    Wait(2000)
    NXT.Notify("~g~NXT Anti-Cheat~w~\nProtection active", "success")
end)

-- Recevoir mise à jour des features depuis le serveur
RegisterNetEvent('nxt:client:updateFeatures')
AddEventHandler('nxt:client:updateFeatures', function(features)
    NXT.Features = features
    
    -- Mettre à jour les détections locales
    if features then
        Config.Detections.Aimbot = features.aimbot or false
        Config.Detections.SpeedHack = features.speedhack or false
        Config.Detections.Noclip = features.noclip or false
        Config.Detections.GodMode = features.godmode or false
        Config.Detections.WeaponModifier = features.weaponModifier or false
        Config.Detections.VehicleModifier = features.vehicleModifier or false
        Config.Detections.Teleport = features.teleport or false
        Config.Detections.ResourceInjection = features.resourceInjection or false
        Config.Detections.MenuDetection = features.menuDetection or false
    end
    
    print("^2[NXT Anti-Cheat]^7 Fonctionnalités mises à jour")
end)

-- Anti-tampering: Vérifier que le script n'est pas arrêté
CreateThread(function()
    local lastHeartbeat = GetGameTimer()
    
    while true do
        Wait(10000) -- Vérifier toutes les 10 secondes
        
        local now = GetGameTimer()
        if now - lastHeartbeat > 15000 then
            -- Le script semble avoir été arrêté puis redémarré
            NXT.SendDetection("Script Tampering", {
                type = "Heartbeat Interrupted",
                timeDiff = now - lastHeartbeat
            })
        end
        
        lastHeartbeat = now
    end
end)

-- Désactiver certains contrôles de triche courants
CreateThread(function()
    while true do
        Wait(0)
        
        -- Désactiver spectator mode
        if NetworkIsInSpectatorMode() then
            NetworkSetInSpectatorMode(false, PlayerPedId())
        end
        
        -- Désactiver thermal vision
        if GetUsingseethrough() then
            SetSeethrough(false)
        end
        
        -- Désactiver night vision pour les tricheurs
        local nightVision = IsNightvisionActive()
        if nightVision and not IsPedInAnyVehicle(PlayerPedId(), false) then
            SetNightvision(false)
        end
    end
end)

-- Nettoyer les objets spammés
CreateThread(function()
    local checkedObjects = {}
    
    while true do
        Wait(5000)
        
        local ped = PlayerPedId()
        local coords = GetEntityCoords(ped)
        local objects = GetGamePool('CObject')
        
        local nearbyCount = 0
        for _, obj in ipairs(objects) do
            local objCoords = GetEntityCoords(obj)
            local distance = #(coords - objCoords)
            
            if distance < 50.0 then
                nearbyCount = nearbyCount + 1
            end
        end
        
        -- Trop d'objets à proximité = spam suspect
        if nearbyCount > 100 then
            NXT.SendDetection("Object Spam", {
                objectCount = nearbyCount,
                area = "50m radius"
            })
        end
    end
end)
