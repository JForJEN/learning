<?php
echo "PHP is working!";
echo "<br>PHP Version: " . phpversion();
echo "<br>Current time: " . date('Y-m-d H:i:s');
echo "<br>Environment variables:";
echo "<pre>";
print_r($_ENV);
echo "</pre>";
?> 