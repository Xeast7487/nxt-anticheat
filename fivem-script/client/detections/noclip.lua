-- Détection Noclip
CreateThread(function()
    while true do
        Wait(2000)
        
        if not Config.Detections.Noclip then
            goto continue
        end
        
        local ped = PlayerPedId()
        local vehicle = GetVehiclePedIsIn(ped, false)
        
        if vehicle ~= 0 then
            local velocity = GetEntityVelocity(vehicle)
            local speed = GetEntitySpeed(vehicle)
            
            -- Détecter mouvement sans collision
            if not IsEntityTouchingEntity(vehicle, vehicle) and speed > 10 then
                local raycast = StartShapeTestCapsule(
                    GetEntityCoords(vehicle).x,
                    GetEntityCoords(vehicle).y,
                    GetEntityCoords(vehicle).z,
                    GetEntityCoords(vehicle).x,
                    GetEntityCoords(vehicle).y,
                    GetEntityCoords(vehicle).z - 2.0,
                    1.0,
                    10,
                    vehicle,
                    7
                )
                
                local _, hit, _, _, _ = GetShapeTestResult(raycast)
                
                if not hit and velocity.z > 0.5 then
                    NXT.SendDetection("Noclip Suspect", {
                        speed = speed,
                        velocity = velocity,
                        vehicle = GetDisplayNameFromVehicleModel(GetEntityModel(vehicle))
                    })
                end
            end
        end
        
        ::continue::
    end
end)
