const { query, pool } = require('../config/database');
const { mapInputToDatabase, mapDatabaseToOutput } = require('../utils/mapper');

/**
 * Cria um novo pedido
 */
const create = async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    const inputOrder = req.body;

    if (!inputOrder.numeroPedido || !inputOrder.valorTotal || !inputOrder.dataCriacao || !inputOrder.items) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios faltando',
        required: ['numeroPedido', 'valorTotal', 'dataCriacao', 'items']
      });
    }

    if (!Array.isArray(inputOrder.items) || inputOrder.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'O pedido deve conter pelo menos um item'
      });
    }

    for (const item of inputOrder.items) {
      if (!item.idItem || !item.quantidadeItem || !item.valorItem) {
        return res.status(400).json({
          success: false,
          message: 'Cada item deve ter idItem, quantidadeItem e valorItem'
        });
      }
    }

    const mappedOrder = mapInputToDatabase(inputOrder);

    await client.query('BEGIN');

    const orderExists = await client.query(
      'SELECT order_id FROM orders WHERE order_id = $1',
      [mappedOrder.orderId]
    );

    if (orderExists.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'Pedido já existe',
        orderId: mappedOrder.orderId
      });
    }

    const orderResult = await client.query(
      'INSERT INTO orders (order_id, value, creation_date) VALUES ($1, $2, $3) RETURNING *',
      [mappedOrder.orderId, mappedOrder.value, mappedOrder.creationDate]
    );

    const createdOrder = orderResult.rows[0];

    const itemsPromises = mappedOrder.items.map(item =>
      client.query(
        'INSERT INTO items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *',
        [mappedOrder.orderId, item.productId, item.quantity, item.price]
      )
    );

    const itemsResults = await Promise.all(itemsPromises);
    const createdItems = itemsResults.map(result => result.rows[0]);

    await client.query('COMMIT');

    const outputOrder = mapDatabaseToOutput(createdOrder, createdItems);

    res.status(201).json({
      success: true,
      message: 'Pedido criado com sucesso',
      data: outputOrder
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar pedido:', error);
    next(error);
  } finally {
    client.release();
  }
};

/**
 * Obtém um pedido específico pelo ID
 */
const getById = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const orderResult = await query(
      'SELECT * FROM orders WHERE order_id = $1',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado',
        orderId
      });
    }

    const order = orderResult.rows[0];

    const itemsResult = await query(
      'SELECT * FROM items WHERE order_id = $1',
      [orderId]
    );

    const items = itemsResult.rows;

    const outputOrder = mapDatabaseToOutput(order, items);

    res.json({
      success: true,
      data: outputOrder
    });
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    next(error);
  }
};

/**
 * Lista todos os pedidos
 */
const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'creation_date', order = 'DESC' } = req.query;
    
    const offset = (page - 1) * limit;

    const validSortFields = ['creation_date', 'value', 'order_id'];
    const validOrders = ['ASC', 'DESC'];

    if (!validSortFields.includes(sortBy)) {
      return res.status(400).json({
        success: false,
        message: 'Campo de ordenação inválido',
        validFields: validSortFields
      });
    }

    if (!validOrders.includes(order.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Ordem inválida',
        validOrders: validOrders
      });
    }

    const ordersResult = await query(
      `SELECT * FROM orders ORDER BY ${sortBy} ${order} LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await query('SELECT COUNT(*) as total FROM orders');
    const total = parseInt(countResult.rows[0].total);

    const ordersWithItems = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsResult = await query(
          'SELECT * FROM items WHERE order_id = $1',
          [order.order_id]
        );
        return mapDatabaseToOutput(order, itemsResult.rows);
      })
    );

    res.json({
      success: true,
      data: ordersWithItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    next(error);
  }
};

/**
 * Atualiza um pedido
 */
const update = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { orderId } = req.params;
    const inputOrder = req.body;

    if (!inputOrder.numeroPedido || !inputOrder.valorTotal || !inputOrder.dataCriacao || !inputOrder.items) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios faltando',
        required: ['numeroPedido', 'valorTotal', 'dataCriacao', 'items']
      });
    }

    if (!Array.isArray(inputOrder.items) || inputOrder.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'O pedido deve conter pelo menos um item'
      });
    }

    const orderExists = await client.query(
      'SELECT * FROM orders WHERE order_id = $1',
      [orderId]
    );

    if (orderExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado',
        orderId
      });
    }

    const mappedOrder = mapInputToDatabase(inputOrder);

    await client.query('BEGIN');

    const updateOrderResult = await client.query(
      'UPDATE orders SET value = $1, creation_date = $2, updated_at = CURRENT_TIMESTAMP WHERE order_id = $3 RETURNING *',
      [mappedOrder.value, mappedOrder.creationDate, orderId]
    );

    const updatedOrder = updateOrderResult.rows[0];

    await client.query('DELETE FROM items WHERE order_id = $1', [orderId]);

    const itemsPromises = mappedOrder.items.map(item =>
      client.query(
        'INSERT INTO items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *',
        [orderId, item.productId, item.quantity, item.price]
      )
    );

    const itemsResults = await Promise.all(itemsPromises);
    const updatedItems = itemsResults.map(result => result.rows[0]);

    await client.query('COMMIT');

    const outputOrder = mapDatabaseToOutput(updatedOrder, updatedItems);

    res.json({
      success: true,
      message: 'Pedido atualizado com sucesso',
      data: outputOrder
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar pedido:', error);
    next(error);
  } finally {
    client.release();
  }
};

/**
 * Deleta um pedido
 */
const deleteOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const orderExists = await query(
      'SELECT * FROM orders WHERE order_id = $1',
      [orderId]
    );

    if (orderExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado',
        orderId
      });
    }

    await query('DELETE FROM orders WHERE order_id = $1', [orderId]);

    res.json({
      success: true,
      message: 'Pedido deletado com sucesso',
      orderId
    });
  } catch (error) {
    console.error('Erro ao deletar pedido:', error);
    next(error);
  }
};

module.exports = {
  create,
  getById,
  list,
  update,
  delete: deleteOrder
};