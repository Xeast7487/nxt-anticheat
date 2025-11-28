-- Détection God Mode
CreateThread(function()
    local lastHealth = 0
    local lastArmor = 0
    local damageCount = 0
    
    while true do
        Wait(500)
        
        if not Config.Detections.GodMode then
            goto continue
        end
        
        local ped = PlayerPedId()
        local health = GetEntityHealth(ped)
        local armor = GetPedArmour(ped)
        local maxHealth = GetEntityMaxHealth(ped)
        
        -- Vérifier invincibilité
        if GetPlayerInvincible(PlayerId()) then
            NXT.SendDetection("God Mode", {
                type = "Invincible Flag",
                health = health,
                maxHealth = maxHealth
            })
        end
        
        -- Vérifier santé anormale
        if health > maxHealth + 50 then
            NXT.SendDetection("God Mode", {
                type = "Health Overflow",
                health = health,
                maxHealth = maxHealth
            })
        end
        
        -- Vérifier régénération rapide
        if lastHealth > 0 then
            local healthDiff = health - lastHealth
            if healthDiff > Config.Limits.MaxHealthRegen and health < maxHealth then
                damageCount = damageCount + 1
                
                if damageCount >= 3 then
                    NXT.SendDetection("God Mode", {
                        type = "Fast Health Regen",
                        healthGain = healthDiff,
                        maxAllowed = Config.Limits.MaxHealthRegen
                    })
                    damageCount = 0
                end
            end
        end
        
        lastHealth = health
        lastArmor = armor
        
        ::continue::
    end
end)
