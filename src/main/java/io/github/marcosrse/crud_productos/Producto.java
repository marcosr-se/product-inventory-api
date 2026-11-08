package io.github.marcosrse.crud_productos;

public class Producto {
    private Integer id;
    private String nombre;
    private Double precio;
    private Integer stock;

    public Producto(String nombre, Double precio, Integer stockInicial){
        this.nombre = nombre;
        this.precio = precio;
        stock = stockInicial;
    }
    public Producto(){}

    public Integer getId(){
        return id;
    }
    public void setId(Integer nuevoID){
        this.id = nuevoID;
    }
    public String getNombre(){
        return nombre;
    
    }
    public Double getPrecio(){
        return precio;
    }
    public Integer getStock(){
        return stock;
    }
    public void setPrecio(Double nuevoPrecio){
        precio = nuevoPrecio;
    }
    public void setNombre(String nuevoNombre){
        nombre = nuevoNombre;
    }
    public void setStock(Integer nuevoStock){
        stock = nuevoStock;
    }
}


