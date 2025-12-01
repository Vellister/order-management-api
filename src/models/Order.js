const { query, pool } = require('../config/database');

/**
 * Model para gerenciamento de pedidos
 */
class Order {
  /**
   * Cria um novo pedido com seus itens
   * @param {Object} orderData - Dados do pedido mapeados
   * @returns {Object} Pedido criado
   */
  static async create(orderData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insere o pedido
      const orderResult = await client.query(
        'INSERT INTO orders (order_id, value, creation_date) VALUES ($1, $2, $3) RETURNING *',
        [orderData.orderId, orderData.value, orderData.creationDate]
      );
      
      const createdOrder = orderResult.rows[0];
      
      // Insere os itens
      const itemsPromises = orderData.items.map(item =>
        client.query(
          'INSERT INTO items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *',
          [orderData.orderId, item.productId, item.quantity, item.price]
        )
      );
      
      const itemsResults = await Promise.all(itemsPromises);
      const createdItems = itemsResults.map(result => result.rows[0]);
      
      await client.query('COMMIT');
      
      return {
        order: createdOrder,
        items: createdItems
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Busca pedido por ID
   * @param {string} orderId - ID do pedido
   * @returns {Object|null} Pedido encontrado
   */
  static async findById(orderId) {
    const orderResult = await query(
      'SELECT * FROM orders WHERE order_id = $1',
      [orderId]
    );
    
    if (orderResult.rows.length === 0) {
      return null;
    }
    
    const order = orderResult.rows[0];
    
    const itemsResult = await query(
      'SELECT * FROM items WHERE order_id = $1',
      [orderId]
    );
    
    return {
      order,
      items: itemsResult.rows
    };
  }

  /**
   * Lista todos os pedidos com paginação
   * @param {Object} options - Opções de paginação
   * @returns {Object} Lista de pedidos e informações de paginação
   */
  static async findAll(options = {}) {
    const { page = 1, limit = 10, sortBy = 'creation_date', order = 'DESC' } = options;
    const offset = (page - 1) * limit;
    
    // Busca pedidos
    const ordersResult = await query(
      `SELECT * FROM orders ORDER BY ${sortBy} ${order} LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    // Conta total
    const countResult = await query('SELECT COUNT(*) as total FROM orders');
    const total = parseInt(countResult.rows[0].total);
    
    // Busca itens para cada pedido
    const ordersWithItems = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsResult = await query(
          'SELECT * FROM items WHERE order_id = $1',
          [order.order_id]
        );
        return {
          order,
          items: itemsResult.rows
        };
      })
    );
    
    return {
      orders: ordersWithItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Atualiza um pedido
   * @param {string} orderId - ID do pedido
   * @param {Object} orderData - Novos dados do pedido
   * @returns {Object} Pedido atualizado
   */
  static async update(orderId, orderData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Atualiza o pedido
      const orderResult = await client.query(
        'UPDATE orders SET value = $1, creation_date = $2, updated_at = CURRENT_TIMESTAMP WHERE order_id = $3 RETURNING *',
        [orderData.value, orderData.creationDate, orderId]
      );
      
      // Remove itens antigos
      await client.query('DELETE FROM items WHERE order_id = $1', [orderId]);
      
      // Insere novos itens
      const itemsPromises = orderData.items.map(item =>
        client.query(
          'INSERT INTO items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *',
          [orderId, item.productId, item.quantity, item.price]
        )
      );
      
      const itemsResults = await Promise.all(itemsPromises);
      const updatedItems = itemsResults.map(result => result.rows[0]);
      
      await client.query('COMMIT');
      
      return {
        order: orderResult.rows[0],
        items: updatedItems
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Deleta um pedido
   * @param {string} orderId - ID do pedido
   * @returns {boolean} True se deletado com sucesso
   */
  static async delete(orderId) {
    const result = await query(
      'DELETE FROM orders WHERE order_id = $1 RETURNING *',
      [orderId]
    );
    
    return result.rows.length > 0;
  }

  /**
   * Verifica se pedido existe
   * @param {string} orderId - ID do pedido
   * @returns {boolean} True se existe
   */
  static async exists(orderId) {
    const result = await query(
      'SELECT order_id FROM orders WHERE order_id = $1',
      [orderId]
    );
    
    return result.rows.length > 0;
  }
}

module.exports = Order;