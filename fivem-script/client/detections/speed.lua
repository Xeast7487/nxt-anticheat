-- Détection Speed Hack
CreateThread(function()
    local lastCoords = nil
    local lastCheck = GetGameTimer()
    
    while true do
        Wait(1000)
        
        if not Config.Detections.SpeedHack then
            goto continue
        end
        
        local ped = PlayerPedId()
        local vehicle = GetVehiclePedIsIn(ped, false)
        
        if vehicle ~= 0 then
            local speed = GetEntitySpeed(vehicle)
            
            if speed > Config.Limits.MaxSpeed then
                NXT.SendDetection("Speed Hack", {
                    speed = speed,
                    vehicle = GetDisplayNameFromVehicleModel(GetEntityModel(vehicle)),
                    maxAllowed = Config.Limits.MaxSpeed
                })
            end
        end
        
        -- Vérifier téléportation
        if Config.Detections.Teleport and lastCoords then
            local currentCoords = GetEntityCoords(ped)
            local distance = NXT.GetDistance(lastCoords, currentCoords)
            local timeDiff = (GetGameTimer() - lastCheck) / 1000
            
            if distance > Config.Limits.MaxTeleportDistance and timeDiff < 2 then
                NXT.SendDetection("Teleport", {
                    distance = distance,
                    timeDiff = timeDiff,
                    from = lastCoords,
                    to = currentCoords
                })
            end
        end
        
        lastCoords = GetEntityCoords(ped)
        lastCheck = GetGameTimer()
        
        ::continue::
    end
end)
