var summation = function(predictorArr)
{
	var sum = 0;
	predictorArr.forEach(function(element) {
		sum+=element;
	});
  return sum;

}

var square = function(predictorArr, shift)
{
	var newArr = [];
	predictorArr.forEach(function(element) {
		var shiftedVal = element-shift;
		newArr.push(shiftedVal*shiftedVal);
	});
	return newArr;
}

var mean = function(predictorArr)
{
	var elementLength = predictorArr.length;
	var sum = summation(predictorArr);
	return sum/elementLength;
}

var multiplyArr = function(predictorArr, criterionArr)
{
	var newArr = [];
	for(var i = 0; i<predictorArr.length; i++)
	{
		newArr.push(predictorArr[i]*criterionArr[i]);
	}
	return newArr;
}

var arrShift  = function(predictorArr, shift)
{
	var newArr = [];
	predictorArr.forEach(function(element) {
		var shiftedVal = element-shift;
		newArr.push(shiftedVal);
	});
	return newArr;
}

var stdDev = function(predictorArr) //http://onlinestatbook.com/2/summarizing_distributions/variability.html
{
	var mu = mean(predictorArr);
	var n = predictorArr.length;
	var squareShift = square(predictorArr,mu);
	var sumSquareShifted = summation(squareShift);
	var variance = sumSquareShifted/n;
	return Math.sqrt(variance);
}

var correlation = function(predictorArr, criterionArr)
{
	var muX = mean(predictorArr);
	var muY = mean(criterionArr);
	var multipliedxy = multiplyArr(arrShift(predictorArr,muX),arrShift(criterionArr,muY));
	var sumMultipliedxy = summation(multipliedxy);
	var sumSquaredX = summation(square(predictorArr,muX));
	var sumSquaredY = summation(square(criterionArr,muY));
	var denominator = Math.sqrt(sumSquaredX*sumSquaredY);
	return sumMultipliedxy/denominator;
}

var linearRegressionSlope = function(predictorArr, criterionArr) //http://onlinestatbook.com/2/regression/intro.html
{
	var r = correlation(predictorArr,criterionArr);
	var s_x = stdDev(predictorArr);
	var s_y = stdDev(criterionArr);
	return r*s_y/s_x;
}

var linearRegressionIntercept = function(predictorArr,criterionArr)
{
	var M_x = mean(predictorArr);
	var M_y = mean(criterionArr);
	var b = linearRegressionSlope(predictorArr,criterionArr);
	return M_y - b*M_x;
}

