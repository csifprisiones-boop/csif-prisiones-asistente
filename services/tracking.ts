import { supabase } from './supabase'

export const logInteraction = async (interactionType: string, details?: any) => {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await supabase.from('user_interactions').insert({
            user_id: user.id,
            interaction_type: interactionType,
            details: details
        })
    } catch (error) {
        console.error('Error logging interaction:', error)
    }
}
