package io.github.marcosrse.crud_productos;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {
    private InventarioRepository repositorio;
    @Autowired
    public ProductoController(InventarioRepository repositorio){
        this.repositorio = repositorio;
    }
    @GetMapping
    public List<Producto> obtenerTodos(){
        return repositorio.obtenerTodos();
    }
    @PostMapping
    public void guardarProducto(@RequestBody Producto producto){
        repositorio.guardarProducto(producto);
    }
    @PutMapping("/{id}/stock")
    public void modificarStock(@PathVariable Integer id, @RequestParam int cantidad, @RequestParam String operacion) {
        repositorio.actualizarStock(id, cantidad, operacion);
    }
    @DeleteMapping("/{id}")
    public void eliminarProducto(@PathVariable Integer id){
        repositorio.eliminarProducto(id);
    }
}
