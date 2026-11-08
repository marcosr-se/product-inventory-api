package io.github.marcosrse.crud_productos;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.springframework.stereotype.Repository;
@Repository
public class InventarioRepository {
    private HashMap<Integer, Producto> baseDatos = new HashMap<>();
    private int contadorId = 0;

    public void guardarProducto(Producto producto){
        if (producto.getId() == null || producto.getId() == 0) {
            producto.setId(++contadorId);
        }
        baseDatos.put(producto.getId(), producto);
    }
    public List<Producto> obtenerTodos(){
        return new ArrayList<>(baseDatos.values());
    }
    public void actualizarStock(Integer id, Integer cantidad, String tipoMovimiento ){
        Producto producto = baseDatos.get(id);
        if (producto!=null) {
            int stockActual = producto.getStock();
            if (tipoMovimiento.equals("entrada")) {
                producto.setStock(stockActual+cantidad);
            }
            else if(tipoMovimiento.equals("salida")){
                if (cantidad>stockActual) {
                    throw new IllegalArgumentException("Stock insuficiente para realizar la retirada");
                }
                else{
                    producto.setStock(stockActual-cantidad);
                }
            }
        }
    }
    public void eliminarProducto(Integer id){
        baseDatos.remove(id);
    }
}
