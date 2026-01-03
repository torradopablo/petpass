
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

class OrderRepository {
    async create(orderData) {
        const { data, error } = await supabase.from('orders').insert([orderData]).select().single();
        if (error) throw error;
        return data;
    }

    async updateStatus(id, status) {
        const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single();
        if (error) throw error;
        return data;
    }
}

module.exports = new OrderRepository();
