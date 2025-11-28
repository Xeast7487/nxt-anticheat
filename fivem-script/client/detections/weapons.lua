-- Détection armes et véhicules modifiés
CreateThread(function()
    while true do
        Wait(3000)
        
        local ped = PlayerPedId()
        
        -- Vérifier armes
        if Config.Detections.WeaponModifier then
            local _, currentWeapon = GetCurrentPedWeapon(ped, true)
            
            -- Vérifier arme blacklistée
            for _, blacklistedWeapon in ipairs(Config.BlacklistedWeapons) do
                if currentWeapon == blacklistedWeapon then
                    RemoveWeaponFromPed(ped, currentWeapon)
                    NXT.SendDetection("Arme Blacklistée", {
                        weapon = currentWeapon,
                        weaponName = GetWeapontypeModel(currentWeapon)
                    })
                end
            end
            
            -- Vérifier dégâts modifiés
            local damage = GetWeaponDamage(currentWeapon)
            if damage > 500 then -- Dégâts anormalement élevés
                NXT.SendDetection("Weapon Modifier", {
                    weapon = currentWeapon,
                    damage = damage
                })
            end
        end
        
        -- Vérifier véhicule
        if Config.Detections.VehicleModifier then
            local vehicle = GetVehiclePedIsIn(ped, false)
            
            if vehicle ~= 0 then
                local vehicleModel = GetEntityModel(vehicle)
                
                -- Vérifier véhicule blacklisté
                for _, blacklistedVehicle in ipairs(Config.BlacklistedVehicles) do
                    if vehicleModel == GetHashKey(blacklistedVehicle) then
                        DeleteVehicle(vehicle)
                        NXT.SendDetection("Véhicule Blacklisté", {
                            vehicle = blacklistedVehicle,
                            model = vehicleModel
                        })
                    end
                end
                
                -- Vérifier vitesse max modifiée
                local maxSpeed = GetVehicleEstimatedMaxSpeed(vehicle)
                if maxSpeed > 200.0 then
                    NXT.SendDetection("Vehicle Modifier", {
                        vehicle = GetDisplayNameFromVehicleModel(vehicleModel),
                        maxSpeed = maxSpeed
                    })
                end
            end
        end
    end
end)
