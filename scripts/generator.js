var test = "\
<?xml version='1.0'?>\
<generator>\
    <meta>\
        <title>Basic Test</title>\
        <author>A. Wilson</author>\
        <version>1.0</version>\
    </meta>\
    <template> \
    	<select name='test'></select> \
    	Test \
    	<select name='test2'/> \
    	<dice n='1' sides='6' /> \
    	<with var='d6'> \
    		<select name='test2' /> \
    		<element><var var='d6' /> <var var='d6' /></element>  \
    	</with> \
    	</template> \
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
		case "dice": return evaluateDice($generator, $element);
		case "element": //fall through
		case "el": return evaluateElement($generator, $element);
		case "generator": return evaluateGenerator($generator);
		case "if": return evaluateIf($generator, $element);
		case "import": return evaluateImport($generator, $element);
		case "open": return evaluateOpen($generator, $element);
		case "select": //fall through
		case "sel": return evaluateSelect($generator, $element);
		case "table": return evaluateTable($generator, $element);
		case "template": return evaluateTemplate($generator, $element);
		case "with": return evaluateWith($generator, $element);
		case "var": return evaluateVar($generator, $element);
		default:
	}
}
function evaluateDice($generator, $element){
	/*
	Evaluate to the integer value of the dice roll
    ...syntax: <dice n="[integer]" sides="[integer]" />
    */
	$element = $element[0];
	if("n" in $element.attributes && "sides" in $element.attributes){
		var n = parseInt($element.attributes["n"].value);
		var sides = parseInt($element.attributes["sides"].value);
		var output = 0;
		for(n; n > 0; n--){
			output += Math.floor(Math.random() * sides) + 1;
		}
		return output;
	}
}
function evaluateGenerator($generator){
	//preProcess($generator);
	return evaluate($generator, $generator.children( "template:first" ));
}
function evaluateIf($generator, $element){
	/*
	If 'flag' attribute matches 'is' attribute in the cache, evaluate then. Otherwise, evaluate else.
    ...syntax:
        <if flag="test" is="match">
            <then></then>
            <else></else>
        </if>
    */
}
function evaluateImport($generator, $element){/*TODO after API implementation*/}
function evaluateOpen($generator, $element){/*TODO after API implementation*/}
function evaluateSelect($generator, $element){
	/*
	Evaluate to the top-level tag with a matching name. If the 'from' attribute is provided, do this on the import
    with a matching name.
    ...syntax: <select name="target name" />
    ...syntax: <select name="target name" from="target import" />
    ...syntax: <sel name="target name" />
    */
    //if("from" in $element.attributes){}
   	targetName = $element[0].attributes["name"];
   	$targetSet = $generator.children("[name="+targetName.value+"]:first");
	return evaluate($generator, $targetSet)
}
function evaluateTable($generator, $element){
	/*
	Select a random tag from the given set.
    ...syntax:
        <table>
            <element weight="3.0">A</element>
            <element>B</element>
            <select name="C" weight="4.0"/>
        </table>
    */
    function getWeight($element){
    	if("weight" in $element[0].attributes){
    		return float($element[0].attributes["weight"].value)
    	} else {
    		return 1.0
    	}
    }
    $subElements = $element.children();
    len = $subElements.length;
    randomNum = Math.floor(Math.random() * len) + 1;
    $elementToEvaluate = $element.children(":nth-child("+randomNum+")");
    return evaluate($generator, $elementToEvaluate);
}
function evaluateTemplate($generator, $element){
	//Alias for evaluateElement
	return evaluateElement($generator, $element);
}
function evaluateElement($generator, $element){
	//Return the text of the element, after resolving any recurrences.
	$element = $.extend(true, {}, $element);
	$element.children().each(function(){
		$(this).text(evaluate($generator, $(this)));
	})
	return $element.text();
}
function evaluateWith($generator, $element){
	/*
	...syntax:
	<with var="id">
		<sel name="save branch" />
		<sel name="eval branch" />
	</with>
	*/
	var save_branch = $element.children("*:first-child");
	var save_val = evaluate($generator, save_branch);
	if("var" in $element[0].attributes){
		var save_as = $element[0].attributes['var'].value;
		$generator = $.extend(true, {}, $generator);
		$generator['cache'][save_as] = save_val;
	}
	var eval_branch = $element.children("*:nth-child(2)");
	return evaluate($generator, eval_branch);
}
function evaluateVar($generator, $element){
	if("var" in $element[0].attributes){
		var save_as = $element[0].attributes['var'].value;
		return $generator['cache'][save_as];
	} else {
		return "";
	}
}
function preProcess($generator){/*TODO after API implementation*/}
function weightedChoice(choices){
	//take a array of arrys [choice, weight], return one at random
	var total = 0;
	for(choice in choices){
		total += choices[choice][1];
	}
	r = Math.random() * total;
	upto = 0;
	for(choice in choices){
		if(upto+choices[choice][1] > r){
			return choices[choice][0];
		}
		upto += choices[choice][1];
	}
}
//Events
function generatorButtonOnClick(){
	$( "#generator-post" ).html( $.now() );
}

$( document ).ready(function(){
	$( "#generator-button" ).click(function(){
		generatorButtonOnClick();
	});
});