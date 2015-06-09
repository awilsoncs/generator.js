var test = "\
<?xml version='1.0'?>\
<generator>\
    <meta>\
        <title>Basic Test</title>\
        <author>A. Wilson</author>\
        <version>1.0</version>\
    </meta>\
    <template><select name='test'></select> Test <select name='test2'/></template>\
    <table name='test'>\
        <element>result1</element>\
        <element>result2</element>\
        <element>result3</element>\
        <element>result4</element>\
    </table>\
    <table name='test2'>\
        <element>result5</element>\
        <element>result6</element>\
        <element>result7</element>\
        <element>result8</element>\
    </table>\
</generator>"


function evaluateGeneratorFile(generatorFile){
	//Start the generator evaluation and return the result.
	var $generator;
	try{
		$generator = loadGeneratorFromFile(generatorFile);
	} catch(err) {
		console.log("Error loading the $generator.");
		return "Error- Generator could not be loaded."
	}
	$generator["imports"] = {};
	$generator["cache"] = {};
	return evaluate($generator, $generator);
}

function loadGeneratorFromFile(generatorFile){
	//Load the $generator and return the root
	var xmlDoc = $.parseXML(generatorFile),
		$xml = $( xmlDoc ),
		$generator = $xml.find( 'generator' );
  	return $generator;
}

//Language Evaluation
function evaluate($generator, $element){
	console.log("***********");
	console.log("Generator: ");
	console.log($generator);
	console.log("Element: ");
	console.log($element);
	switch($element[0].nodeName.toLowerCase()){
		case "dice": 		return evaluate_dice($generator, $element);
		case "element": 	//fall through
		case "el": 			return evaluate_element($generator, $element);
		case "generator":   return evaluate_generator($generator);
		case "if": 			return evaluate_if($generator, $element);
		case "import": 		return evaluate_import($generator, $element);
		case "open": 		return evaluate_open($generator, $element);
		case "select": 		//fall through
		case "sel": 		return evaluate_select($generator, $element);
		case "table":       return evaluate_table($generator, $element);
		case "template": 	return evaluate_template($generator, $element);
		default:
	}
}

function evaluate_dice($generator, $element){
	//Evalute to the integer value of the dice roll
}

function evaluate_generator($generator){
	//preProcess($generator);
	return evaluate($generator, $generator.children( "template:first" ));
}

function evaluate_if($generator, $element){}
function evaluate_import($generator, $element){}
function evaluate_open($generator, $element){}
function evaluate_select($generator, $element){
	/*
	Evaluate to the top-level tag with a matching name. If the 'from' attribute is provided, do this on the import
    with a matching name.
    ...syntax: <select name="target name" />
    ...syntax: <select name="target name" from="target import" />
    ...syntax: <sel name="target name" />
    */
   	targetName = $element[0].attributes["name"];
   	console.log(targetName.value);
   	$targetSet = $generator.children("[name="+targetName.value+"]");
	return evaluate($generator, $targetSet)
}

function evaluate_table($generator, $element){
	/*
	Select a random tag from the given set.
    ...syntax:
        <table>
            <element weight="3.0">A</element>
            <element>B</element>
            <select name="C" weight="4.0"/>
        </table>
    */
    $subElements = $element.children();
    len = $subElements.length;
    randomNum = Math.floor(Math.random() * len) + 1;
    $elementToEvaluate = $element.children(":nth-child("+randomNum+")");
    return evaluate($generator, $elementToEvaluate);
}

function evaluate_template($generator, $element){
	return evaluate_element($generator, $element);
}

function evaluate_element($generator, $element){
	$element = $.extend(true, {}, $element);
	$element.children().each(function(){
		$(this).text(evaluate($generator, $(this)));
	})
	return $element.text();
}

function pre_process($generator){}
function weighted_choice(choices){}

//Events
function generatorButtonOnClick(){
	$( "#generator-post" ).html( $.now() );
}

$( document ).ready(function(){
	$( "#generator-button" ).click(function(){
		$generatorButtonOnClick();
	});
});