# Alke Wallet

Aplicación web que simula una billetera digital. Permite iniciar sesión, ver saldo, realizar depósitos, enviar dinero, agregar contactos y revisar movimientos.  
Todo funciona en el navegador usando `localStorage`.

---

## Acceso

Para ingresar usa estas credenciales:

- **Usuario:** user@alke.com  
- **Contraseña:** 123456  

Si las credenciales son correctas, se accede al menú principal.  
Si no, aparece un mensaje de error.

---

## Funcionalidad

### Menú principal
- Muestra el **saldo actual**.
- Muestra el **último movimiento**.
- Accesos rápidos a:
  - Depósito
  - Enviar dinero
  - Movimientos

### Depósito
- Ingresa un monto mayor a 0.
- El saldo aumenta.
- Se registra una transacción tipo **Depósito**.

### Enviar dinero
- Autocompletar de contactos con jQuery.
- Valida saldo suficiente.
- Registra una **Transferencia**.
- Permite agregar nuevos contactos (nombre + alias).

### Movimientos
- Tabla con todas las transacciones.
- Depósitos en verde (+).
- Transferencias en rojo (–).

---
